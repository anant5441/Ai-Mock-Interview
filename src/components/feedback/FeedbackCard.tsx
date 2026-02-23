import type { UserFeedback } from "@/types/feedback";
import { User } from "lucide-react";

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

interface FeedbackCardProps {
    feedback: UserFeedback;
    index: number;
}

const FeedbackCard = ({ feedback, index }: FeedbackCardProps) => {
    const createdDate = feedback.createdAt?.toDate?.();

    return (
        <div
            className="group relative rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-xl p-5 transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* hover glow */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/15 group-hover:via-purple-500/15 group-hover:to-pink-500/15 -z-10 blur-sm transition-all duration-300" />

            <div className="flex items-start gap-3.5">
                {/* avatar */}
                {feedback.userImage ? (
                    <img
                        src={feedback.userImage}
                        alt={feedback.userName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/40 dark:ring-white/20 shrink-0"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-2 ring-white/40 dark:ring-white/20 shrink-0">
                        <User className="w-5 h-5 text-white" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-sm truncate">
                            {feedback.userName}
                        </h4>
                        {createdDate && (
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {timeAgo(createdDate)}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-wrap break-words">
                        {feedback.message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeedbackCard;
