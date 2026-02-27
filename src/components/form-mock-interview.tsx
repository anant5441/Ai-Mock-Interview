import type { Interview } from "@/types";
import type { QuestionBank } from "@/types/question-bank";
import CustomBreadCrum from "./custom-bread-crum";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Headings } from "./heading";
import { Loader, Trash2, Sparkles, BookOpen } from "lucide-react";
import { Separator } from "./ui/separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { chatSession } from "@/scripts";
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { cn } from "@/lib/utils";

interface FormMockInterviewProps {
    initialData: Interview | null;
}

const formSchema = z.object({
    position: z
        .string()
        .min(1, "Position is required")
        .max(100, "Position must be 100 characters or less"),
    description: z.string().min(10, "Description is required"),
    experience: z.coerce
        .number()
        .min(0, "Experience cannot be empty or negative"),
    techStack: z.string().min(1, "Tech stack must be at least a character"),
});

type FormData = z.infer<typeof formSchema>;

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema) as Resolver<FormData>,
        defaultValues: initialData || {},
    });
    const { isValid, isSubmitting } = form.formState;
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { userId } = useAuth();

    // Custom bank integration
    const [interviewType, setInterviewType] = useState<"ai" | "custom">("ai");
    const [availableBanks, setAvailableBanks] = useState<QuestionBank[]>([]);
    const [selectedBankId, setSelectedBankId] = useState<string>("");
    const [loadingBanks, setLoadingBanks] = useState(false);

    // Fetch available banks when custom is selected
    useEffect(() => {
        if (interviewType !== "custom" || !userId) return;
        setLoadingBanks(true);
        const fetchBanks = async () => {
            try {
                const publicQ = query(
                    collection(db, "questionBanks"),
                    where("isPublic", "==", true)
                );
                const myQ = query(
                    collection(db, "questionBanks"),
                    where("createdBy", "==", userId)
                );
                const [publicSnap, mySnap] = await Promise.all([
                    getDocs(publicQ),
                    getDocs(myQ),
                ]);
                const banksMap = new Map<string, QuestionBank>();
                publicSnap.docs.forEach((d) =>
                    banksMap.set(d.id, { id: d.id, ...d.data() } as QuestionBank)
                );
                mySnap.docs.forEach((d) =>
                    banksMap.set(d.id, { id: d.id, ...d.data() } as QuestionBank)
                );
                setAvailableBanks(Array.from(banksMap.values()));
            } catch {
                toast.error("Failed to load question banks");
            } finally {
                setLoadingBanks(false);
            }
        };
        fetchBanks();
    }, [interviewType, userId]);

    const title = initialData?.position ? initialData.position : "Create New Mock Interview";

    const breadCrumpPage = initialData?.position ? initialData.position : "Create ";

    const actions = initialData ? "Save Changes" : "Create";
    const toastMessage = initialData
        ? { title: "Updated..!", description: "Changes saved successfully..." }
        : { title: "Created..!", description: "New Mock Interview created..." };

    const cleanAiResponse = (responseText: string) => {
        // Step 1: Trim any surrounding whitespace
        let cleanText = responseText.trim();

        // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
        cleanText = cleanText.replace(/(json|```|`)/g, "");

        // Step 3: Extract a JSON array by capturing text between square brackets
        const jsonArrayMatch = cleanText.match(/\[.*\]/s);
        if (jsonArrayMatch) {
            cleanText = jsonArrayMatch[0];
        } else {
            throw new Error("No JSON array found in response");
        }

        // Step 4: Parse the clean JSON text into an array of objects
        try {
            return JSON.parse(cleanText);
        } catch (error) {
            throw new Error("Invalid JSON format: " + (error as Error)?.message);
        }
    };

    const generateAiResponse = async (data: FormData) => {
        const prompt = `
        As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

        [
            { "question": "<Question text>", "answer": "<Answer text>" },
            ...
        ]

        Job Information:
        - Job Position: ${data?.position}
        - Job Description: ${data?.description}
        - Years of Experience Required: ${data?.experience}
        - Tech Stacks: ${data?.techStack}

        The questions should assess skills in ${data?.techStack} development and best practices, problem-solving, and experience handling complex requirements. Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.
        `;

        const aiResult = await chatSession.sendMessage(prompt);
        console.log("AI Response:", aiResult.response.text().trim());
        const cleanedResponse = cleanAiResponse(aiResult.response.text());

        return cleanedResponse;
    }

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);

            if (interviewType === "custom" && !initialData) {
                // Use custom bank questions — generate AI answers via Gemini
                const selectedBank = availableBanks.find((b) => b.id === selectedBankId);
                if (!selectedBank) {
                    toast.error("Please select a question bank");
                    return;
                }

                toast.info("Generating AI answers...", {
                    description: "Gemini is preparing ideal answers for each question.",
                });

                const techStackStr = Array.isArray(selectedBank.techStack)
                    ? selectedBank.techStack.join(", ")
                    : data.techStack;

                const answerPrompt = `You are an expert technical interviewer. For each of the following interview questions, provide a detailed ideal answer.

Context:
- Topic: ${selectedBank.title}
- Tech Stack: ${techStackStr}
- Experience Level: ${selectedBank.experienceLevel}+ years

Questions:
${selectedBank.questions.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}

Return a JSON array of objects with "question" and "answer" fields. Each answer should be comprehensive (3-5 sentences). Return ONLY the JSON array, no code blocks.`;

                const aiAnswerResult = await chatSession.sendMessage(answerPrompt);
                const cleanedAnswers = cleanAiResponse(aiAnswerResult.response.text());

                await addDoc(collection(db, "interviews"), {
                    ...data,
                    userId,
                    questions: cleanedAnswers,
                    createdAt: serverTimestamp(),
                });
                toast("Created!", { description: "Interview created with AI-generated answers ready for feedback." });
            } else if (initialData) {
                // Update existing interview
                if (isValid) {
                    const aiResult = await generateAiResponse(data);

                    await updateDoc(doc(db, "interviews", initialData?.id), {
                        questions: aiResult,
                        ...data,
                        updatedAt: serverTimestamp(),
                    }).catch((error) => console.log(error));
                    toast(toastMessage.title, { description: toastMessage.description });
                }
            }
            else {
                // Create new interview with AI
                if (isValid) {
                    const aiResult = await generateAiResponse(data);

                    await addDoc(collection(db, "interviews"), {
                        ...data,
                        userId,
                        questions: aiResult,
                        createdAt: serverTimestamp()
                    });
                    toast(toastMessage.title, { description: toastMessage.description });
                }
            }
            navigate("/generate", { replace: true });
        } catch (error) {
            console.log(error);
            toast.error("Error..", {
                description: `Something went wrong. Please try again later`,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            form.reset({
                position: initialData.position,
                description: initialData.description,
                experience: initialData.experience,
                techStack: initialData.techStack,
            });
        }
    }, [initialData, form]);
    return (
        <div className="w-full flex-col space-y-4">
            <CustomBreadCrum
                breadCrumbPage={breadCrumpPage}
                breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
            />
            <div className="mt-4 flex items-center justify-between w-full">
                <Headings title={title} isSubHeading />

                {initialData && (
                    <Button size={"icon"} variant={"ghost"}>
                        <Trash2 className="min-w-4 min-h-4 text-red-500" />
                    </Button>
                )}
            </div>
            <Separator className="my-4" />

            {/* Interview Type Toggle - only show when creating new */}
            {!initialData && (
                <div className="my-6 space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Interview Type</h3>
                    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                        <button
                            type="button"
                            onClick={() => { setInterviewType("ai"); setSelectedBankId(""); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                                interviewType === "ai"
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                            )}
                        >
                            <Sparkles className="w-4 h-4" /> AI Generated
                        </button>
                        <button
                            type="button"
                            onClick={() => setInterviewType("custom")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                                interviewType === "custom"
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                            )}
                        >
                            <BookOpen className="w-4 h-4" /> Custom Bank
                        </button>
                    </div>

                    {interviewType === "custom" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select Question Bank
                            </label>
                            {loadingBanks ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader className="w-4 h-4 animate-spin" /> Loading banks...
                                </div>
                            ) : availableBanks.length > 0 ? (
                                <select
                                    value={selectedBankId}
                                    onChange={(e) => setSelectedBankId(e.target.value)}
                                    className="w-full h-12 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                                >
                                    <option value="">Choose a question bank...</option>
                                    {availableBanks.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.title} ({b.questions.length} questions)
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No question banks available. Create one first!
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="my-6"></div>
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full p-8 rounded-lg flex-col flex items-start justify-start gap-6 shadow-md "
                >
                    <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Job Role / Job Position</FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Input
                                        className="h-12"
                                        disabled={loading}
                                        placeholder="eg:- Full Stack Developer"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Job Description</FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Textarea
                                        className="h-12"
                                        disabled={loading}
                                        placeholder="eg:- describle your job role"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Years of Experience</FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Input
                                        type="number"
                                        className="h-12"
                                        disabled={loading}
                                        placeholder="eg:- 5 Years"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="techStack"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Tech Stacks</FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Textarea
                                        className="h-12"
                                        disabled={loading}
                                        placeholder="eg:- React, Typescript...(Seperate by comma)"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex item-center justify-end gap-6">
                        <Button
                            type="reset"
                            size={"sm"}
                            variant={"outline"}
                            disabled={isSubmitting || loading}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            size={"sm"}
                            disabled={isSubmitting || !isValid || loading}
                        >
                            {loading ? (
                                <Loader className="text-gray-50 animate-spin" />
                            ) : (
                                actions
                            )}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

