import type { UserFeedback } from "@/types/feedback";
import FeedbackCard from "./FeedbackCard";
import { MessageSquare } from "lucide-react";

interface FeedbackListProps {
    feedbacks: UserFeedback[];
    loading: boolean;
}

const FeedbackList = ({ feedbacks, loading }: FeedbackListProps) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl h-32 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (feedbacks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <MessageSquare className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No feedback yet</h3>
                <p className="text-sm text-muted-foreground">
                    Be the first to share your thoughts!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedbacks.map((fb, i) => (
                <FeedbackCard key={fb.id} feedback={fb} index={i} />
            ))}
        </div>
    );
};

export default FeedbackList;
