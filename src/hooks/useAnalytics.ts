import { db } from "@/config/firebase.config";
import type { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import {
    collection,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

/* ─── derived types ─── */
export interface AnalyticsStats {
    totalInterviews: number;
    totalQuestions: number;
    avgRating: number;
    improvementPct: number;
    strongestSkill: string;
    weakestSkill: string;
}

export interface RatingTimelinePoint {
    date: string;
    rating: number;
    label: string;
}

export interface BreakdownItem {
    name: string;
    count: number;
}

export interface RatingBucket {
    name: string;
    value: number;
    fill: string;
}

export interface SkillRadarPoint {
    skill: string;
    score: number;
    fullMark: number;
}

export interface FeedbackKeyword {
    word: string;
    count: number;
}

export interface SessionTimelinePoint {
    week: string;
    interviews: number;
    questions: number;
}

export function useAnalytics() {
    const { userId } = useAuth();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [answers, setAnswers] = useState<UserAnswer[]>([]);
    const [loading, setLoading] = useState(true);

    /* ─── real-time listeners ─── */
    useEffect(() => {
        if (!userId) return;
        setLoading(true);

        const unsubInterviews = onSnapshot(
            query(collection(db, "interviews"), where("userId", "==", userId)),
            (snap) => {
                setInterviews(
                    snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Interview)
                );
            }
        );

        const unsubAnswers = onSnapshot(
            query(collection(db, "userAnswers"), where("userId", "==", userId)),
            (snap) => {
                setAnswers(
                    snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserAnswer)
                );
                setLoading(false);
            }
        );

        return () => {
            unsubInterviews();
            unsubAnswers();
        };
    }, [userId]);

    /* ─── computed analytics ─── */

    // 1 — Summary stats
    const stats: AnalyticsStats = useMemo(() => {
        const totalInterviews = interviews.length;
        const totalQuestions = answers.length;
        const avgRating =
            totalQuestions > 0
                ? answers.reduce((a, b) => a + b.rating, 0) / totalQuestions
                : 0;

        // improvement: compare first-half avg rating vs second-half
        const sorted = [...answers].sort(
            (a, b) =>
                (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0)
        );
        const mid = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, mid || 1);
        const secondHalf = sorted.slice(mid || 1);
        const firstAvg =
            firstHalf.length > 0
                ? firstHalf.reduce((a, b) => a + b.rating, 0) / firstHalf.length
                : 0;
        const secondAvg =
            secondHalf.length > 0
                ? secondHalf.reduce((a, b) => a + b.rating, 0) / secondHalf.length
                : 0;
        const improvementPct =
            firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

        // skill strengths from techStack
        const skillMap = new Map<string, { total: number; count: number }>();
        for (const iv of interviews) {
            const skills = iv.techStack.split(",").map((s) => s.trim().toLowerCase());
            const ivAnswers = answers.filter((a) => a.mockIdRef === iv.id);
            const ivAvg =
                ivAnswers.length > 0
                    ? ivAnswers.reduce((a, b) => a + b.rating, 0) / ivAnswers.length
                    : 0;
            for (const s of skills) {
                if (!s) continue;
                const cur = skillMap.get(s) || { total: 0, count: 0 };
                cur.total += ivAvg;
                cur.count += 1;
                skillMap.set(s, cur);
            }
        }
        let strongestSkill = "N/A";
        let weakestSkill = "N/A";
        let maxAvg = -1;
        let minAvg = 11;
        for (const [skill, { total, count }] of skillMap) {
            const avg = total / count;
            if (avg > maxAvg) {
                maxAvg = avg;
                strongestSkill = skill;
            }
            if (avg < minAvg) {
                minAvg = avg;
                weakestSkill = skill;
            }
        }

        return {
            totalInterviews,
            totalQuestions,
            avgRating: Math.round(avgRating * 10) / 10,
            improvementPct: Math.round(improvementPct),
            strongestSkill,
            weakestSkill,
        };
    }, [interviews, answers]);

    // 2 — Rating timeline
    const ratingTimeline: RatingTimelinePoint[] = useMemo(() => {
        const sorted = [...answers].sort(
            (a, b) =>
                (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0)
        );
        return sorted.map((a) => ({
            date: a.createdAt?.toDate
                ? a.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—",
            rating: a.rating,
            label: a.question.slice(0, 30) + "…",
        }));
    }, [answers]);

    // 3 — Interview breakdown by position
    const interviewBreakdown: BreakdownItem[] = useMemo(() => {
        const map = new Map<string, number>();
        for (const iv of interviews) {
            const key = iv.position || "Other";
            map.set(key, (map.get(key) || 0) + 1);
        }
        return Array.from(map, ([name, count]) => ({ name, count }));
    }, [interviews]);

    // 4 — Rating distribution (buckets)
    const ratingDistribution: RatingBucket[] = useMemo(() => {
        const buckets = { "9-10 (Excellent)": 0, "7-8 (Good)": 0, "5-6 (Average)": 0, "Below 5": 0 };
        for (const a of answers) {
            if (a.rating >= 9) buckets["9-10 (Excellent)"]++;
            else if (a.rating >= 7) buckets["7-8 (Good)"]++;
            else if (a.rating >= 5) buckets["5-6 (Average)"]++;
            else buckets["Below 5"]++;
        }
        const fills = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];
        return Object.entries(buckets).map(([name, value], i) => ({
            name,
            value,
            fill: fills[i],
        }));
    }, [answers]);

    // 5 — Skill radar
    const skillRadar: SkillRadarPoint[] = useMemo(() => {
        const skillMap = new Map<string, { total: number; count: number }>();
        for (const iv of interviews) {
            const skills = iv.techStack.split(",").map((s) => s.trim());
            const ivAnswers = answers.filter((a) => a.mockIdRef === iv.id);
            const ivAvg =
                ivAnswers.length > 0
                    ? ivAnswers.reduce((a, b) => a + b.rating, 0) / ivAnswers.length
                    : 0;
            for (const s of skills) {
                if (!s) continue;
                const cur = skillMap.get(s) || { total: 0, count: 0 };
                cur.total += ivAvg;
                cur.count += 1;
                skillMap.set(s, cur);
            }
        }
        return Array.from(skillMap, ([skill, { total, count }]) => ({
            skill: skill.charAt(0).toUpperCase() + skill.slice(1),
            score: Math.round((total / count) * 10) / 10,
            fullMark: 10,
        })).slice(0, 8); // max 8 for readability
    }, [interviews, answers]);

    // 6 — Feedback keywords
    const feedbackKeywords: FeedbackKeyword[] = useMemo(() => {
        const stopWords = new Set([
            "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
            "have", "has", "had", "do", "does", "did", "will", "would", "could",
            "should", "may", "might", "shall", "can", "need", "dare", "ought",
            "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
            "as", "into", "through", "during", "before", "after", "above", "below",
            "between", "out", "off", "over", "under", "again", "further", "then",
            "once", "here", "there", "when", "where", "why", "how", "all", "each",
            "every", "both", "few", "more", "most", "other", "some", "such", "no",
            "nor", "not", "only", "own", "same", "so", "than", "too", "very",
            "just", "because", "but", "and", "or", "if", "while", "that", "this",
            "it", "its", "i", "you", "your", "he", "she", "they", "we", "my",
            "his", "her", "their", "our", "me", "him", "them", "us", "what",
            "which", "who", "whom", "these", "those", "am", "about", "also",
            "answer", "question", "user", "response", "provide", "provided",
            "however", "overall", "well", "good", "better", "best",
        ]);
        const wordMap = new Map<string, number>();
        for (const a of answers) {
            const words = (a.feedback || "")
                .toLowerCase()
                .replace(/[^a-z\s]/g, "")
                .split(/\s+/)
                .filter((w) => w.length > 3 && !stopWords.has(w));
            for (const w of words) {
                wordMap.set(w, (wordMap.get(w) || 0) + 1);
            }
        }
        return Array.from(wordMap, ([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);
    }, [answers]);

    // 7 — Session timeline (interviews per week)
    const sessionTimeline: SessionTimelinePoint[] = useMemo(() => {
        const weekMap = new Map<string, { interviews: Set<string>; questions: number }>();
        for (const a of answers) {
            const d = a.createdAt?.toDate?.();
            if (!d) continue;
            const weekStart = new Date(d);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const cur = weekMap.get(key) || { interviews: new Set<string>(), questions: 0 };
            cur.interviews.add(a.mockIdRef);
            cur.questions += 1;
            weekMap.set(key, cur);
        }
        return Array.from(weekMap, ([week, { interviews: ivs, questions }]) => ({
            week,
            interviews: ivs.size,
            questions,
        }));
    }, [answers]);

    return {
        loading,
        stats,
        ratingTimeline,
        interviewBreakdown,
        ratingDistribution,
        skillRadar,
        feedbackKeywords,
        sessionTimeline,
        interviews,
        answers,
    };
}
