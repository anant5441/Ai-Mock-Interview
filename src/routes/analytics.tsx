import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import Container from "@/components/container";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    BarChart3,
    TrendingUp,
    Star,
    Zap as _Zap,
    HelpCircle,
    Award,
    AlertTriangle,
    Loader,
} from "lucide-react";

/* ─── scroll reveal ─── */
function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    el.classList.add("revealed");
                    obs.unobserve(el);
                }
            },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

/* ─── particle canvas ─── */
function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let animId: number;
        const dpr = window.devicePixelRatio || 1;
        const particles: { x: number; y: number; r: number; dx: number; dy: number; o: number }[] = [];
        const resize = () => {
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener("resize", resize);
        for (let i = 0; i < 35; i++) {
            particles.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                r: Math.random() * 1.4 + 0.3,
                dx: (Math.random() - 0.5) * 0.2,
                dy: (Math.random() - 0.5) * 0.2,
                o: Math.random() * 0.18 + 0.05,
            });
        }
        const draw = () => {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            for (const p of particles) {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.offsetWidth) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.offsetHeight) p.dy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.o})`;
                ctx.fill();
            }
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
    }, []);
    return <canvas ref={canvasRef} className="particle-canvas" style={{ width: "100%", height: "100%" }} />;
}

function RevealSection({ children, className = "", delay = "" }: { children: React.ReactNode; className?: string; delay?: string }) {
    const ref = useScrollReveal();
    return <div ref={ref} className={`section-reveal ${delay} ${className}`}>{children}</div>;
}

/* ─── count-up ─── */
function useCountUp(end: number, decimals = 0, duration = 1800) {
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting && !started.current) {
                    started.current = true;
                    let start = 0;
                    const step = end / (duration / 16);
                    const tick = () => {
                        start += step;
                        if (start >= end) { el.textContent = end.toFixed(decimals); return; }
                        el.textContent = start.toFixed(decimals);
                        requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.3 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [end, decimals, duration]);
    return ref;
}

/* ─── stat card ─── */
function StatCard({ icon, label, value, suffix = "", decimals = 0, delay = "" }: {
    icon: React.ReactNode; label: string; value: number; suffix?: string; decimals?: number; delay?: string;
}) {
    const countRef = useCountUp(value, decimals);
    return (
        <RevealSection delay={delay}>
            <div className="glass-card card-glow-overlay p-6 text-center animate-float group" style={{ animationDelay: delay.replace("stagger-", "0.") + "s" }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-4 mx-auto group-hover:animate-icon-bounce">{icon}</div>
                <p className="text-3xl md:text-4xl font-bold"><span ref={countRef}>0</span>{suffix}</p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
        </RevealSection>
    );
}

/* ─── skill card (for text values) ─── */
function SkillStatCard({ icon, label, value, delay = "" }: {
    icon: React.ReactNode; label: string; value: string; delay?: string;
}) {
    return (
        <RevealSection delay={delay}>
            <div className="glass-card card-glow-overlay p-6 text-center animate-float group" style={{ animationDelay: delay.replace("stagger-", "0.") + "s" }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-4 mx-auto group-hover:animate-icon-bounce">{icon}</div>
                <p className="text-xl md:text-2xl font-bold capitalize truncate">{value}</p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
        </RevealSection>
    );
}

/* ─── chart container ─── */
function ChartPanel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <RevealSection className={className}>
            <div className="glass-card p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold mb-6">{title}</h3>
                {children}
            </div>
        </RevealSection>
    );
}

/* ─── custom recharts tooltip ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GlassTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card px-4 py-3 text-sm" style={{ background: "rgba(10,10,10,0.85)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-gray-300 mb-1">{label}</p>
            {payload.map((p: { name: string; value: number; color: string }, i: number) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
            ))}
        </div>
    );
}

/* ─── feedback tag cloud ─── */
function TagCloud({ keywords }: { keywords: { word: string; count: number }[] }) {
    const maxCount = Math.max(...keywords.map((k) => k.count), 1);
    return (
        <div className="flex flex-wrap gap-3 justify-center">
            {keywords.map((k, i) => {
                const scale = 0.7 + (k.count / maxCount) * 0.6;
                const opacity = 0.5 + (k.count / maxCount) * 0.5;
                return (
                    <span
                        key={k.word}
                        className="glass-card px-4 py-2 rounded-full text-sm font-medium animate-float cursor-default capitalize"
                        style={{
                            fontSize: `${scale}rem`,
                            opacity,
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: `${5 + Math.random() * 3}s`,
                        }}
                    >
                        {k.word}
                        <span className="ml-1 text-gray-500 text-xs">({k.count})</span>
                    </span>
                );
            })}
        </div>
    );
}

/* ════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════ */
const AnalyticsPage = () => {
    const { user } = useUser();
    const {
        loading,
        stats,
        ratingTimeline,
        interviewBreakdown,
        ratingDistribution,
        skillRadar,
        feedbackKeywords,
        sessionTimeline,
    } = useAnalytics();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
                <Loader className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good Morning";
        if (h < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden">
            {/* ambient layers */}
            <div className="floating-blob floating-blob-1 top-[-8%] left-[-5%]" />
            <div className="floating-blob floating-blob-2 top-[45%] right-[-8%]" />
            <div className="floating-blob floating-blob-3 bottom-[10%] left-[15%]" />
            <ParticleBackground />

            {/* ─── PERSONAL HEADER ─── */}
            <section className="relative z-10 pt-24 pb-12 md:pt-32 md:pb-16">
                <Container>
                    <div className="flex items-center gap-5 animate-fadeInUp">
                        {user?.imageUrl && (
                            <img
                                src={user.imageUrl}
                                alt={user.fullName || "User"}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/20 shadow-lg shadow-black/40 object-cover"
                            />
                        )}
                        <div>
                            <p className="text-gray-400 text-sm">{greeting()}</p>
                            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                                {user?.firstName || "User"}'s{" "}
                                <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                                    Analytics
                                </span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ─── DIVIDER ─── */}
            <RevealSection><div className="animated-divider expanded max-w-3xl mx-auto" /></RevealSection>

            {/* ─── 1. OVERVIEW CARDS ─── */}
            <section className="relative z-10 py-12 md:py-16">
                <Container>
                    <RevealSection className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold">Overview</h2>
                    </RevealSection>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                        <StatCard icon={<BarChart3 className="w-6 h-6" />} label="Total Interviews" value={stats.totalInterviews} delay="stagger-1" />
                        <StatCard icon={<Star className="w-6 h-6" />} label="Avg Rating" value={stats.avgRating} suffix="/10" decimals={1} delay="stagger-2" />
                        <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Improvement" value={stats.improvementPct} suffix="%" delay="stagger-3" />
                        <StatCard icon={<HelpCircle className="w-6 h-6" />} label="Questions Answered" value={stats.totalQuestions} delay="stagger-4" />
                        <SkillStatCard icon={<Award className="w-6 h-6" />} label="Strongest Skill" value={stats.strongestSkill} delay="stagger-5" />
                        <SkillStatCard icon={<AlertTriangle className="w-6 h-6" />} label="Needs Work" value={stats.weakestSkill} delay="stagger-6" />
                    </div>
                </Container>
            </section>

            {/* ─── 2. PERFORMANCE TREND ─── */}
            <section className="relative z-10 py-12 md:py-16">
                <Container>
                    <ChartPanel title="Performance Trend">
                        {ratingTimeline.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={ratingTimeline}>
                                    <defs>
                                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#22c55e" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                                    <YAxis domain={[0, 10]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                                    <Tooltip content={<GlassTooltip />} />
                                    <Line type="monotone" dataKey="rating" stroke="url(#lineGrad)" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} animationDuration={1500} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-12">No data yet — take an interview to see your trend.</p>
                        )}
                    </ChartPanel>
                </Container>
            </section>

            {/* ─── 3 & 4. BREAKDOWN + DISTRIBUTION (side by side) ─── */}
            <section className="relative z-10 py-12 md:py-16">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Bar chart */}
                        <ChartPanel title="Interview Breakdown">
                            {interviewBreakdown.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={interviewBreakdown}>
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                                        <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip content={<GlassTooltip />} />
                                        <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-500 text-center py-12">No interviews yet.</p>
                            )}
                        </ChartPanel>

                        {/* Donut chart */}
                        <ChartPanel title="Rating Distribution">
                            {ratingDistribution.some((b) => b.value > 0) ? (
                                <div className="relative">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={ratingDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={4}
                                                dataKey="value"
                                                animationDuration={1200}
                                                stroke="none"
                                            >
                                                {ratingDistribution.map((entry, idx) => (
                                                    <Cell key={idx} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<GlassTooltip />} />
                                            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* center avg */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: "-20px" }}>
                                        <div className="text-center">
                                            <p className="text-3xl font-bold">{stats.avgRating}</p>
                                            <p className="text-gray-400 text-xs">AVG</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-12">No ratings yet.</p>
                            )}
                        </ChartPanel>
                    </div>
                </Container>
            </section>

            {/* ─── 5. SKILL RADAR ─── */}
            <section className="relative z-10 py-12 md:py-16">
                <Container>
                    <ChartPanel title="Skill Proficiency">
                        {skillRadar.length > 0 ? (
                            <ResponsiveContainer width="100%" height={360}>
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillRadar}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                                    <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} animationDuration={1500} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-12">Complete interviews to see your skill map.</p>
                        )}
                    </ChartPanel>
                </Container>
            </section>

            {/* ─── 6. FEEDBACK KEYWORDS ─── */}
            <section className="relative z-10 py-12 md:py-16">
                <Container>
                    <ChartPanel title="Feedback Insights">
                        {feedbackKeywords.length > 0 ? (
                            <TagCloud keywords={feedbackKeywords} />
                        ) : (
                            <p className="text-gray-500 text-center py-12">No feedback keywords yet.</p>
                        )}
                    </ChartPanel>
                </Container>
            </section>

            {/* ─── 7. SESSION ANALYTICS ─── */}
            <section className="relative z-10 py-12 md:py-16">
                <Container>
                    <ChartPanel title="Session Activity">
                        {sessionTimeline.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={sessionTimeline}>
                                    <defs>
                                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="week" stroke="#6b7280" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip content={<GlassTooltip />} />
                                    <Area type="monotone" dataKey="questions" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} animationDuration={1500} name="Questions" />
                                    <Area type="monotone" dataKey="interviews" stroke="#22c55e" fill="none" strokeWidth={2} animationDuration={1500} name="Interviews" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-12">No session data yet.</p>
                        )}
                    </ChartPanel>
                </Container>
            </section>

            {/* ─── CTA ─── */}
            <section className="relative z-10 py-16 md:py-20">
                <Container>
                    <RevealSection>
                        <div className="glass-card p-10 md:p-14 text-center max-w-2xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">Keep Improving</h2>
                            <p className="text-gray-400 mb-6">Take another mock interview and watch your scores climb.</p>
                            <a href="/generate/create" className="inline-block px-8 py-3 rounded-full bg-white text-black font-semibold magnetic-btn glow-border pulse-btn transition-all">
                                Start New Interview →
                            </a>
                        </div>
                    </RevealSection>
                </Container>
            </section>

            <div className="h-16" />
        </div>
    );
};

export default AnalyticsPage;
