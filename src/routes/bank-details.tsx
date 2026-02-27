import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
    doc,
    getDoc,
    deleteDoc,
    updateDoc,
    setDoc,
    increment,
    addDoc,
    collection,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import type { QuestionBank } from "@/types/question-bank";
import { Timestamp } from "firebase/firestore";
import CustomBreadCrum from "@/components/custom-bread-crum";
import { Headings } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Heart,
    Trash2,
    Pencil,
    Play,
    Globe,
    Lock,
    BookOpen,
    Sparkles,
    Loader,
    ArrowLeft,
    Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { chatSession } from "@/scripts";

const BankDetailsPage = () => {
    const { bankId } = useParams<{ bankId: string }>();
    const navigate = useNavigate();
    const { userId } = useAuth();
    const { user } = useUser();

    const [bank, setBank] = useState<QuestionBank | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likingInProgress, setLikingInProgress] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: "",
        description: "",
        techStack: "",
        experienceLevel: 0,
        isPublic: true,
        questions: [] as string[],
    });
    const [saving, setSaving] = useState(false);
    const [usingBank, setUsingBank] = useState(false);

    const isOwner = bank?.createdBy === userId;

    // Fetch bank
    useEffect(() => {
        if (!bankId) return;
        const fetchBank = async () => {
            try {
                const snap = await getDoc(doc(db, "questionBanks", bankId));
                if (snap.exists()) {
                    const data = { id: snap.id, ...snap.data() } as QuestionBank;
                    setBank(data);
                    setEditData({
                        title: data.title,
                        description: data.description,
                        techStack: Array.isArray(data.techStack)
                            ? data.techStack.join(", ")
                            : (data.techStack as string),
                        experienceLevel: data.experienceLevel,
                        isPublic: data.isPublic,
                        questions: [...data.questions],
                    });
                } else {
                    navigate("/question-banks", { replace: true });
                }
            } catch {
                toast.error("Error", { description: "Failed to load question bank." });
            } finally {
                setLoading(false);
            }
        };
        fetchBank();
    }, [bankId, navigate]);

    // Check like status
    useEffect(() => {
        if (!bankId || !userId) return;
        const checkLike = async () => {
            const snap = await getDoc(
                doc(db, "questionBanks", bankId, "likes", userId)
            );
            setIsLiked(snap.exists());
        };
        checkLike();
    }, [bankId, userId]);

    const handleLike = async () => {
        if (!bankId || !userId || !user) return;
        setLikingInProgress(true);
        try {
            const likeRef = doc(db, "questionBanks", bankId, "likes", userId);
            const bankRef = doc(db, "questionBanks", bankId);
            const likeSnap = await getDoc(likeRef);

            if (likeSnap.exists()) {
                await deleteDoc(likeRef);
                await updateDoc(bankRef, { likes: increment(-1) });
                setIsLiked(false);
                setBank((prev) =>
                    prev ? { ...prev, likes: Math.max(0, prev.likes - 1) } : prev
                );
            } else {
                await setDoc(likeRef, {
                    userId,
                    userName: user.fullName || user.username || "Anonymous",
                    likedAt: new Date(),
                });
                await updateDoc(bankRef, { likes: increment(1) });
                setIsLiked(true);
                setBank((prev) =>
                    prev ? { ...prev, likes: prev.likes + 1 } : prev
                );
            }
        } catch {
            toast.error("Error", { description: "Could not update like." });
        } finally {
            setLikingInProgress(false);
        }
    };

    const handleDelete = async () => {
        if (!bankId) return;
        setDeleting(true);
        try {
            await deleteDoc(doc(db, "questionBanks", bankId));
            toast.success("Deleted", {
                description: "Question bank deleted successfully.",
            });
            navigate("/question-banks", { replace: true });
        } catch {
            toast.error("Error", { description: "Failed to delete." });
        } finally {
            setDeleting(false);
            setDeleteOpen(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!bankId) return;
        const validQuestions = editData.questions.filter(
            (q) => q.trim().length >= 5
        );
        if (editData.title.length < 3) {
            toast.error("Title must be at least 3 characters");
            return;
        }
        if (validQuestions.length < 3) {
            toast.error("At least 3 questions with 5+ characters required");
            return;
        }

        setSaving(true);
        try {
            await updateDoc(doc(db, "questionBanks", bankId), {
                title: editData.title,
                description: editData.description,
                techStack: editData.techStack
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                experienceLevel: editData.experienceLevel,
                isPublic: editData.isPublic,
                questions: validQuestions,
            });

            setBank((prev) =>
                prev
                    ? {
                        ...prev,
                        title: editData.title,
                        description: editData.description,
                        techStack: editData.techStack
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        experienceLevel: editData.experienceLevel,
                        isPublic: editData.isPublic,
                        questions: validQuestions,
                    }
                    : prev
            );
            toast.success("Saved!", { description: "Changes saved successfully." });
            setIsEditing(false);
        } catch {
            toast.error("Error", { description: "Failed to save changes." });
        } finally {
            setSaving(false);
        }
    };

    const handleUseBank = async () => {
        if (!bank || !userId) return;
        setUsingBank(true);
        try {
            toast.info("Generating AI answers...", {
                description: "Gemini is preparing ideal answers for each question. This may take a moment.",
            });

            // Generate ideal answers using Gemini for each question
            const techStackStr = Array.isArray(bank.techStack)
                ? bank.techStack.join(", ")
                : bank.techStack;

            const prompt = `You are an expert technical interviewer. For each of the following interview questions, provide a detailed ideal answer that a strong candidate should give.

Context:
- Topic: ${bank.title}
- Tech Stack: ${techStackStr}
- Experience Level: ${bank.experienceLevel}+ years

Questions:
${bank.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return your response as a JSON array of objects with "question" and "answer" fields only. Each answer should be comprehensive (3-5 sentences). Format:
[
  { "question": "<original question>", "answer": "<ideal answer>" }
]

Return ONLY the JSON array, no code blocks, no extra text.`;

            const aiResult = await chatSession.sendMessage(prompt);
            let responseText = aiResult.response.text().trim();

            // Clean JSON response
            responseText = responseText.replace(/(json|```|`)/g, "");
            const jsonMatch = responseText.match(/\[.*\]/s);
            if (!jsonMatch) throw new Error("Invalid AI response format");

            const questionsWithAnswers: { question: string; answer: string }[] =
                JSON.parse(jsonMatch[0]);

            const interviewDoc = await addDoc(collection(db, "interviews"), {
                position: bank.title,
                description: bank.description,
                experience: bank.experienceLevel,
                techStack: techStackStr,
                userId,
                questions: questionsWithAnswers,
                createdAt: serverTimestamp(),
            });
            toast.success("Interview Created!", {
                description: "Starting your interview with AI-generated answers ready for feedback.",
            });
            navigate(`/generate/interview/${interviewDoc.id}`, { replace: true });
        } catch {
            toast.error("Error", {
                description: "Failed to create interview from bank. Please try again.",
            });
        } finally {
            setUsingBank(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full space-y-6 pb-10">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-48 rounded-2xl" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!bank) return null;

    const techStacks = Array.isArray(bank.techStack)
        ? bank.techStack
        : (bank.techStack as string).split(",").map((s: string) => s.trim());
    const createdDate =
        bank.createdAt instanceof Timestamp
            ? bank.createdAt.toDate().toLocaleDateString("en-US", {
                dateStyle: "long",
            })
            : "Recently";

    return (
        <div className="w-full space-y-6 pb-10">
            {/* Delete Confirm Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Question Bank</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{bank.title}&quot;? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Breadcrumb */}
            <CustomBreadCrum
                breadCrumbPage={bank.title}
                breadCrumpItems={[
                    { label: "Question Banks", link: "/question-banks" },
                ]}
            />

            {/* Hero Card */}
            <div className="relative p-8 rounded-2xl bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />

                <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        {isEditing ? (
                            <Input
                                value={editData.title}
                                onChange={(e) =>
                                    setEditData((d) => ({ ...d, title: e.target.value }))
                                }
                                className="text-2xl font-bold h-12"
                                placeholder="Bank title"
                            />
                        ) : (
                            <Headings title={bank.title} />
                        )}

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>by {bank.createdByName}</span>
                            <span>·</span>
                            <span>{createdDate}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                                {bank.isPublic ? (
                                    <>
                                        <Globe className="w-3.5 h-3.5" /> Public
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-3.5 h-3.5" /> Private
                                    </>
                                )}
                            </span>
                        </div>

                        {isEditing ? (
                            <Textarea
                                value={editData.description}
                                onChange={(e) =>
                                    setEditData((d) => ({ ...d, description: e.target.value }))
                                }
                                className="min-h-[80px]"
                                placeholder="Description"
                            />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">
                                {bank.description}
                            </p>
                        )}

                        {/* Tech Stack */}
                        {isEditing ? (
                            <Input
                                value={editData.techStack}
                                onChange={(e) =>
                                    setEditData((d) => ({ ...d, techStack: e.target.value }))
                                }
                                placeholder="React, TypeScript (comma separated)"
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {techStacks.map((tech, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/30"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" /> {bank.questions.length}{" "}
                                questions
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4" /> {bank.experienceLevel}+ yrs
                                experience
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Heart
                                    className={cn(
                                        "w-4 h-4",
                                        isLiked && "fill-red-500 text-red-500"
                                    )}
                                />{" "}
                                {bank.likes || 0} likes
                            </span>
                        </div>

                        {isEditing && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Experience Level:</span>
                                <Input
                                    type="number"
                                    value={editData.experienceLevel}
                                    onChange={(e) =>
                                        setEditData((d) => ({
                                            ...d,
                                            experienceLevel: Number(e.target.value),
                                        }))
                                    }
                                    className="w-24 h-9"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditData((d) => ({ ...d, isPublic: !d.isPublic }))
                                    }
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                                        editData.isPublic
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    )}
                                >
                                    {editData.isPublic ? (
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
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleLike}
                            disabled={likingInProgress}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer",
                                isLiked
                                    ? "bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
                            )}
                        >
                            <Heart
                                className={cn(
                                    "w-4 h-4 transition-transform duration-300",
                                    isLiked && "fill-current scale-110",
                                    likingInProgress && "animate-pulse"
                                )}
                            />
                            {isLiked ? "Liked" : "Like"}
                        </button>

                        {isOwner && !isEditing && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Pencil className="w-4 h-4" /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </Button>
                            </>
                        )}

                        {isEditing && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    disabled={saving}
                                    className="gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                >
                                    {saving ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" /> Save
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Separator />

            {/* Questions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Questions
                    </h3>
                    {!isEditing && (
                        <Button
                            onClick={handleUseBank}
                            disabled={usingBank}
                            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        >
                            {usingBank ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Play className="w-4 h-4" /> Use This Bank
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    {isEditing
                        ? editData.questions.map((q, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold shrink-0 mt-1">
                                    {i + 1}
                                </div>
                                <Textarea
                                    value={q}
                                    onChange={(e) => {
                                        const updated = [...editData.questions];
                                        updated[i] = e.target.value;
                                        setEditData((d) => ({ ...d, questions: updated }));
                                    }}
                                    className="flex-1 min-h-[60px]"
                                />
                                {editData.questions.length > 3 && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            const updated = editData.questions.filter(
                                                (_, idx) => idx !== i
                                            );
                                            setEditData((d) => ({ ...d, questions: updated }));
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0 mt-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))
                        : bank.questions.map((q, i) => (
                            <div
                                key={i}
                                className="group flex items-start gap-4 p-4 rounded-xl 
                    bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm 
                    border border-gray-200/50 dark:border-gray-700/30
                    hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700/50
                    transition-all duration-200"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold shrink-0">
                                    {i + 1}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pt-1">
                                    {q}
                                </p>
                            </div>
                        ))}
                </div>

                {isEditing && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            setEditData((d) => ({ ...d, questions: [...d.questions, ""] }))
                        }
                        className="gap-1 mt-2"
                    >
                        + Add Question
                    </Button>
                )}
            </div>
        </div>
    );
};

export default BankDetailsPage;
