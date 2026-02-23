import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { toast } from "sonner";
import { Loader, Send } from "lucide-react";

const feedbackSchema = z.object({
    message: z
        .string()
        .min(10, "Feedback must be at least 10 characters")
        .max(500, "Feedback must be under 500 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
    onSubmitSuccess: () => void;
}

const FeedbackForm = ({ onSubmitSuccess }: FeedbackFormProps) => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid },
    } = useForm<FeedbackFormData>({
        resolver: zodResolver(feedbackSchema) as Resolver<FeedbackFormData>,
        mode: "onChange",
        defaultValues: { message: "" },
    });

    const messageValue = watch("message") || "";

    const onSubmit = async (data: FeedbackFormData) => {
        if (!user) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "feedback"), {
                userId: user.id,
                userName: user.fullName || user.firstName || "Anonymous",
                userImage: user.imageUrl || null,
                message: data.message.trim(),
                createdAt: serverTimestamp(),
            });
            toast.success("Thank you!", {
                description: "Your feedback has been submitted.",
            });
            reset();
            onSubmitSuccess();
        } catch {
            toast.error("Error", {
                description: "Failed to submit feedback. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-2xl p-6 md:p-8">
            {/* subtle gradient highlight */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 -z-10 blur-sm" />

            <h2 className="text-xl font-bold mb-1">Share Your Feedback</h2>
            <p className="text-sm text-muted-foreground mb-5">
                Help us improve your interview experience
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <textarea
                        {...register("message")}
                        placeholder="Tell us what you think…"
                        rows={4}
                        disabled={loading}
                        className="w-full rounded-xl border border-input bg-background/80 dark:bg-white/5 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-shadow"
                    />
                    <div className="flex items-center justify-between mt-1.5 px-1">
                        {errors.message ? (
                            <p className="text-xs text-red-500">{errors.message.message}</p>
                        ) : (
                            <span />
                        )}
                        <span
                            className={`text-xs ${messageValue.length > 500
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }`}
                        >
                            {messageValue.length}/500
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !isValid}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-indigo-500/25"
                >
                    {loading ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Submitting…
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Submit Feedback
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
