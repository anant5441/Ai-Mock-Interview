import { useAuth, useUser } from "@clerk/clerk-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    FormProvider,
    useForm,
    useFieldArray,
    type Resolver,
} from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import CustomBreadCrum from "@/components/custom-bread-crum";
import { Headings } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, Plus, Trash2, Globe, Lock } from "lucide-react";

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    techStack: z.string().min(1, "Tech stack is required"),
    experienceLevel: z.coerce
        .number()
        .min(0, "Experience level cannot be negative"),
    isPublic: z.boolean(),
    questions: z
        .array(
            z.object({
                value: z.string().min(5, "Each question must be at least 5 characters"),
            })
        )
        .min(3, "At least 3 questions are required"),
});

type FormData = z.infer<typeof formSchema>;

const CreateBankPage = () => {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema) as Resolver<FormData>,
        defaultValues: {
            title: "",
            description: "",
            techStack: "",
            experienceLevel: 0,
            isPublic: true,
            questions: [{ value: "" }, { value: "" }, { value: "" }],
        },
        mode: "onChange",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions",
    });

    const { isValid, isSubmitting } = form.formState;
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { userId } = useAuth();
    const { user } = useUser();
    const isPublic = form.watch("isPublic");

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);

            await addDoc(collection(db, "questionBanks"), {
                title: data.title,
                description: data.description,
                techStack: data.techStack.split(",").map((s) => s.trim()).filter(Boolean),
                experienceLevel: data.experienceLevel,
                createdBy: userId,
                createdByName: user?.fullName || user?.username || "Anonymous",
                isPublic: data.isPublic,
                questions: data.questions.map((q) => q.value),
                createdAt: serverTimestamp(),
                likes: 0,
            });

            toast.success("Created!", {
                description: "Your question bank has been created successfully.",
            });
            navigate("/question-banks", { replace: true });
        } catch {
            toast.error("Error", {
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex-col space-y-4 pb-10">
            <CustomBreadCrum
                breadCrumbPage="Create"
                breadCrumpItems={[
                    { label: "Question Banks", link: "/question-banks" },
                ]}
            />

            <div className="mt-4 flex items-center justify-between w-full">
                <Headings
                    title="Create Question Bank"
                    description="Build your own curated set of interview questions"
                    isSubHeading
                />
            </div>
            <Separator className="my-4" />

            <div className="relative mt-6">
                {/* Decorative gradient background */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-xl" />

                <FormProvider {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full p-8 rounded-2xl flex-col flex items-start justify-start gap-6 
              bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl 
              border border-white/20 dark:border-gray-700/50 
              shadow-2xl"
                    >
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="w-full space-y-2">
                                    <div className="w-full flex items-center justify-between">
                                        <FormLabel>Bank Title</FormLabel>
                                        <FormMessage className="text-sm" />
                                    </div>
                                    <FormControl>
                                        <Input
                                            className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                            disabled={loading}
                                            placeholder="eg: React Advanced Concepts"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="w-full space-y-2">
                                    <div className="w-full flex items-center justify-between">
                                        <FormLabel>Description</FormLabel>
                                        <FormMessage className="text-sm" />
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-[80px] bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                            disabled={loading}
                                            placeholder="Describe what this question bank covers..."
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Tech Stack & Experience Level */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="techStack"
                                render={({ field }) => (
                                    <FormItem className="w-full space-y-2">
                                        <div className="w-full flex items-center justify-between">
                                            <FormLabel>Tech Stack</FormLabel>
                                            <FormMessage className="text-sm" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                                disabled={loading}
                                                placeholder="React, TypeScript, Node.js (comma separated)"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="experienceLevel"
                                render={({ field }) => (
                                    <FormItem className="w-full space-y-2">
                                        <div className="w-full flex items-center justify-between">
                                            <FormLabel>Experience Level (years)</FormLabel>
                                            <FormMessage className="text-sm" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                                disabled={loading}
                                                placeholder="eg: 3"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Visibility Toggle */}
                        <FormField
                            control={form.control}
                            name="isPublic"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <div className="flex items-center gap-4">
                                        <FormLabel className="text-base">Visibility</FormLabel>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange(!field.value)}
                                            disabled={loading}
                                            className={`
                        relative inline-flex h-10 items-center gap-2 rounded-full px-4 
                        transition-all duration-300 text-sm font-medium cursor-pointer
                        ${isPublic
                                                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                }
                      `}
                                        >
                                            {isPublic ? (
                                                <>
                                                    <Globe className="w-4 h-4" /> Public
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4" /> Private
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {isPublic
                                            ? "Everyone can discover and use this bank"
                                            : "Only you can see and use this bank"}
                                    </p>
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Questions Section */}
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Questions
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Add at least 3 questions to your bank
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => append({ value: "" })}
                                    disabled={loading}
                                    className="gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Question
                                </Button>
                            </div>

                            {form.formState.errors.questions?.root && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.questions.root.message}
                                </p>
                            )}

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={`questions.${index}.value`}
                                        render={({ field: inputField }) => (
                                            <FormItem>
                                                <div className="flex items-start gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold shrink-0 mt-1">
                                                        {index + 1}
                                                    </div>
                                                    <FormControl>
                                                        <Textarea
                                                            className="min-h-[60px] bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 flex-1"
                                                            disabled={loading}
                                                            placeholder={`Question ${index + 1}...`}
                                                            {...inputField}
                                                        />
                                                    </FormControl>
                                                    {fields.length > 3 && (
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => remove(index)}
                                                            disabled={loading}
                                                            className="shrink-0 mt-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <FormMessage className="ml-11 text-sm" />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="w-full flex items-center justify-end gap-4">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isSubmitting || loading}
                                onClick={() => navigate("/question-banks")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting || !isValid || loading}
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                            >
                                {loading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Create Bank"
                                )}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};

export default CreateBankPage;
