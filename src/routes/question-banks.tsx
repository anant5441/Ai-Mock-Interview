import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    increment,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import type { QuestionBank } from "@/types/question-bank";
import { Headings } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Plus,
    Heart,
    Eye,
    Globe,
    Lock,
    BookOpen,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

const QuestionBanksPage = () => {
    const [publicBanks, setPublicBanks] = useState<QuestionBank[]>([]);
    const [myBanks, setMyBanks] = useState<QuestionBank[]>([]);
    const [loadingPublic, setLoadingPublic] = useState(true);
    const [loadingMy, setLoadingMy] = useState(true);
    const [activeTab, setActiveTab] = useState<"public" | "mine">("public");
    const [likedBanks, setLikedBanks] = useState<Set<string>>(new Set());
    const [likingId, setLikingId] = useState<string | null>(null);

    const { userId } = useAuth();
    const { user } = useUser();

    // Fetch public banks
    useEffect(() => {
        const q = query(
            collection(db, "questionBanks"),
            where("isPublic", "==", true)
        );
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const banks: QuestionBank[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as QuestionBank[];
                setPublicBanks(banks);
                setLoadingPublic(false);
            },
            () => {
                toast.error("Error", {
                    description: "Failed to load public question banks.",
                });
                setLoadingPublic(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // Fetch user's banks
    useEffect(() => {
        if (!userId) return;
        const q = query(
            collection(db, "questionBanks"),
            where("createdBy", "==", userId)
        );
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const banks: QuestionBank[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as QuestionBank[];
                setMyBanks(banks);
                setLoadingMy(false);
            },
            () => {
                toast.error("Error", {
                    description: "Failed to load your question banks.",
                });
                setLoadingMy(false);
            }
        );
        return () => unsubscribe();
    }, [userId]);

    // Check which banks user has liked
    useEffect(() => {
        if (!userId || publicBanks.length === 0) return;

        const checkLikes = async () => {
            const liked = new Set<string>();
            for (const bank of publicBanks) {
                const likeRef = doc(db, "questionBanks", bank.id, "likes", userId);
                const snap = await getDoc(likeRef);
                if (snap.exists()) liked.add(bank.id);
            }
            setLikedBanks(liked);
        };
        checkLikes();
    }, [userId, publicBanks]);

    const handleLike = async (bankId: string) => {
        if (!userId || !user) return;
        setLikingId(bankId);

        try {
            const likeRef = doc(db, "questionBanks", bankId, "likes", userId);
            const bankRef = doc(db, "questionBanks", bankId);
            const likeSnap = await getDoc(likeRef);

            if (likeSnap.exists()) {
                await deleteDoc(likeRef);
                await updateDoc(bankRef, { likes: increment(-1) });
                setLikedBanks((prev) => {
                    const next = new Set(prev);
                    next.delete(bankId);
                    return next;
                });
            } else {
                await setDoc(likeRef, {
                    userId,
                    userName: user.fullName || user.username || "Anonymous",
                    likedAt: new Date(),
                });
                await updateDoc(bankRef, { likes: increment(1) });
                setLikedBanks((prev) => new Set(prev).add(bankId));
            }
        } catch {
            toast.error("Error", { description: "Could not update like." });
        } finally {
            setLikingId(null);
        }
    };

    const banks = activeTab === "public" ? publicBanks : myBanks;
    const loading = activeTab === "public" ? loadingPublic : loadingMy;

    return (
        <div className="w-full space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Headings
                    title="Question Banks"
                    description="Create, share, and discover curated interview question sets"
                />
                <Link to="/question-banks/create">
                    <Button
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                    >
                        <Plus className="w-4 h-4" /> Create Bank
                    </Button>
                </Link>
            </div>

            <Separator />

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("public")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                        activeTab === "public"
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                    <Globe className="w-4 h-4" /> Public Banks
                </button>
                <button
                    onClick={() => setActiveTab("mine")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                        activeTab === "mine"
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                    <Lock className="w-4 h-4" /> My Banks
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-72 rounded-2xl" />
                    ))
                ) : banks.length > 0 ? (
                    banks.map((bank) => (
                        <BankCard
                            key={bank.id}
                            bank={bank}
                            isLiked={likedBanks.has(bank.id)}
                            isLiking={likingId === bank.id}
                            onLike={() => handleLike(bank.id)}
                            isOwner={bank.createdBy === userId}
                        />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center h-72 gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            {activeTab === "mine"
                                ? "No question banks yet"
                                : "No public banks available"}
                        </h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                            {activeTab === "mine"
                                ? "Create your first question bank and start practicing!"
                                : "Be the first to share a question bank with the community!"}
                        </p>
                        {activeTab === "mine" && (
                            <Link to="/question-banks/create">
                                <Button
                                    size="sm"
                                    className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                >
                                    <Plus className="w-4 h-4" /> Create Bank
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Bank Card Component ── */
interface BankCardProps {
    bank: QuestionBank;
    isLiked: boolean;
    isLiking: boolean;
    onLike: () => void;
    isOwner: boolean;
}

const BankCard = ({
    bank,
    isLiked,
    isLiking,
    onLike,
    isOwner,
}: BankCardProps) => {
    const techStacks =
        typeof bank.techStack === "string"
            ? (bank.techStack as string).split(",").map((s: string) => s.trim())
            : bank.techStack;

    const createdDate =
        bank.createdAt instanceof Timestamp
            ? bank.createdAt.toDate().toLocaleDateString("en-US", {
                dateStyle: "medium",
            })
            : "Recently";

    return (
        <div
            className="group relative p-6 rounded-2xl 
        bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl 
        border border-gray-200/50 dark:border-gray-700/50 
        shadow-lg hover:shadow-2xl
        hover:scale-[1.03] hover:-translate-y-2
        transition-all duration-300 
        flex flex-col gap-4"
        >
            {/* Gradient accent */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                        {bank.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        by {bank.createdByName} · {createdDate}
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {bank.isPublic ? (
                        <Globe className="w-4 h-4 text-indigo-500" />
                    ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                    )}
                    {isOwner && (
                        <span className="text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                            Yours
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {bank.description}
            </p>

            {/* Tech Stack Badges */}
            <div className="flex flex-wrap gap-1.5">
                {techStacks.slice(0, 4).map((tech, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
              bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20
              text-indigo-700 dark:text-indigo-300 
              border border-indigo-200/50 dark:border-indigo-700/30"
                    >
                        {tech}
                    </span>
                ))}
                {techStacks.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                        +{techStacks.length - 4} more
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {bank.questions.length} questions
                </span>
                <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {bank.experienceLevel}+ yrs
                </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onLike();
                    }}
                    disabled={isLiking}
                    className={cn(
                        "flex items-center gap-1.5 text-sm transition-all duration-300 cursor-pointer",
                        isLiked
                            ? "text-red-500"
                            : "text-gray-400 hover:text-red-500"
                    )}
                >
                    <Heart
                        className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            isLiked && "fill-current scale-110",
                            isLiking && "animate-pulse"
                        )}
                    />
                    {bank.likes || 0}
                </button>
                <Link to={`/question-banks/${bank.id}`}>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                        <Eye className="w-4 h-4" /> View
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default QuestionBanksPage;
