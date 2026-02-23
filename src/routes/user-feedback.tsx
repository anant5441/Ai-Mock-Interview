import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import type { UserFeedback } from "@/types/feedback";
import Container from "@/components/container";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackList from "@/components/feedback/FeedbackList";

const UserFeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = useCallback(async () => {
        try {
            const q = query(
                collection(db, "feedback"),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            setFeedbacks(
                snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as UserFeedback)
            );
        } catch {
            // silently fail — list will show empty state
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleSubmitSuccess = () => {
        fetchFeedbacks();
    };

    return (
        <div className="relative min-h-[80vh]">
            {/* ambient gradient background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-3xl" />
                <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-500/8 dark:bg-purple-500/5 blur-3xl" />
            </div>

            <Container className="py-8 md:py-12">
                <div className="max-w-5xl mx-auto space-y-10">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Feedback
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            We value your thoughts — help us build a better platform
                        </p>
                    </div>

                    {/* Form */}
                    <div className="max-w-xl mx-auto">
                        <FeedbackForm onSubmitSuccess={handleSubmitSuccess} />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            Community Feedback
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>

                    {/* List */}
                    <FeedbackList feedbacks={feedbacks} loading={loading} />
                </div>
            </Container>
        </div>
    );
};

export default UserFeedbackPage;
