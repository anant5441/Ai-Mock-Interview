import { useEffect, useRef, useCallback } from "react";
import Container from "@/components/container";
import {
    Target,
    Eye,
    Heart,
    Users,
    Award,
    Zap,
    TrendingUp,
} from "lucide-react";

/* ─── helpers ─── */
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
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

function useCountUp(end: number, duration = 2000) {
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
                        if (start >= end) {
                            el.textContent = end.toLocaleString();
                            return;
                        }
                        el.textContent = Math.floor(start).toLocaleString();
                        requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.3 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [end, duration]);
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

        const particles: {
            x: number;
            y: number;
            r: number;
            dx: number;
            dy: number;
            o: number;
        }[] = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener("resize", resize);

        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                r: Math.random() * 2 + 0.5,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
                o: Math.random() * 0.3 + 0.1,
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

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="particle-canvas"
            style={{ width: "100%", height: "100%" }}
        />
    );
}

/* ─── section wrapper ─── */
function RevealSection({
    children,
    className = "",
    delay = "",
}: {
    children: React.ReactNode;
    className?: string;
    delay?: string;
}) {
    const ref = useScrollReveal();
    return (
        <div ref={ref} className={`section-reveal ${delay} ${className}`}>
            {children}
        </div>
    );
}

/* ─── card with cursor glow ─── */
function GlowCard({
    children,
    className = "",
    animDelay = "",
}: {
    children: React.ReactNode;
    className?: string;
    animDelay?: string;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const handleMouse = useCallback((e: React.MouseEvent) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        cardRef.current?.style.setProperty("--mouse-x", `${x}%`);
        cardRef.current?.style.setProperty("--mouse-y", `${y}%`);
    }, []);

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouse}
            className={`glass-card card-glow-overlay p-8 ${animDelay} ${className}`}
        >
            {children}
        </div>
    );
}

/* ─── page ─── */
const AboutPage = () => {
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden">
            {/* floating blobs */}
            <div className="floating-blob floating-blob-1 top-[-10%] left-[-5%]" />
            <div className="floating-blob floating-blob-2 top-[40%] right-[-8%]" />
            <div className="floating-blob floating-blob-3 bottom-[10%] left-[20%]" />

            {/* particles */}
            <ParticleBackground />

            {/* ─── HERO ─── */}
            <section className="relative z-10 py-28 md:py-40 text-center">
                <Container>
                    <p className="text-sm tracking-[0.3em] uppercase text-gray-400 mb-4 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
                        Get to know us
                    </p>
                    <h1
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight animate-fadeInUp"
                        style={{ animationDelay: "0.25s" }}
                    >
                        We Build the{" "}
                        <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                            Future
                        </span>
                    </h1>
                    <p
                        className="mt-6 max-w-2xl mx-auto text-gray-400 text-lg md:text-xl animate-fadeInUp"
                        style={{ animationDelay: "0.45s" }}
                    >
                        Empowering professionals with AI-driven interview preparation,
                        career coaching, and personalised insights — so every opportunity
                        becomes a success story.
                    </p>
                </Container>
            </section>

            {/* ─── ANIMATED DIVIDER ─── */}
            <RevealSection>
                <div className="animated-divider expanded max-w-xl mx-auto" />
            </RevealSection>

            {/* ─── MISSION / VISION / VALUES ─── */}
            <section className="relative z-10 py-20 md:py-28">
                <Container>
                    <RevealSection className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            Our Core Pillars
                        </h2>
                        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                            The principles that drive every decision we make and every product
                            we ship.
                        </p>
                    </RevealSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Target className="w-8 h-8" />,
                                title: "Our Mission",
                                desc: "To democratise career success using cutting-edge AI that gives every candidate an unfair advantage in interviews.",
                                delay: "stagger-1",
                            },
                            {
                                icon: <Eye className="w-8 h-8" />,
                                title: "Our Vision",
                                desc: "A world where talent — not privilege — determines who lands their dream role, backed by intelligent preparation tools.",
                                delay: "stagger-2",
                            },
                            {
                                icon: <Heart className="w-8 h-8" />,
                                title: "Our Values",
                                desc: "Empathy-first design, relentless innovation, radical transparency, and an obsession with measurable user outcomes.",
                                delay: "stagger-3",
                            },
                        ].map((item) => (
                            <RevealSection key={item.title} delay={item.delay}>
                                <GlowCard className="h-full text-center animate-float" animDelay={item.delay}>
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6 mx-auto">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                                </GlowCard>
                            </RevealSection>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ─── ANIMATED DIVIDER ─── */}
            <RevealSection>
                <div className="animated-divider expanded max-w-3xl mx-auto" />
            </RevealSection>

            {/* ─── STATS ─── */}
            <section className="relative z-10 py-20 md:py-28">
                <Container>
                    <RevealSection className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            By the Numbers
                        </h2>
                    </RevealSection>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: <Users className="w-7 h-7" />, end: 180000, suffix: "+", label: "Active Users" },
                            { icon: <Award className="w-7 h-7" />, end: 1000000, suffix: "+", label: "Interviews Aced" },
                            { icon: <Zap className="w-7 h-7" />, end: 500, suffix: "+", label: "Companies Trust Us" },
                            { icon: <TrendingUp className="w-7 h-7" />, end: 95, suffix: "%", label: "Success Rate" },
                        ].map((stat) => {
                            const countRef = useCountUp(stat.end);
                            return (
                                <RevealSection key={stat.label}>
                                    <div className="glass-card p-6 md:p-8 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4 animate-icon-bounce mx-auto">
                                            {stat.icon}
                                        </div>
                                        <p className="text-3xl md:text-4xl font-bold">
                                            <span ref={countRef}>0</span>
                                            {stat.suffix}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
                                    </div>
                                </RevealSection>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* ─── TEAM / WHY US ─── */}
            <section className="relative z-10 py-20 md:py-28">
                <Container>
                    <RevealSection>
                        <div className="glass-card p-10 md:p-16 text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Why Choose Us?
                            </h2>
                            <p className="text-gray-400 leading-relaxed text-lg">
                                We combine the precision of advanced AI with human empathy to
                                create preparation experiences that truly transform careers. Our
                                platform analyses your strengths, identifies growth areas, and
                                delivers personalised practice sessions that mirror real-world
                                interviews — so when the moment comes, you're already ready.
                            </p>
                            <div className="mt-8">
                                <a
                                    href="/generate"
                                    className="inline-block px-8 py-3 rounded-full bg-white text-black font-semibold magnetic-btn glow-border pulse-btn transition-all"
                                >
                                    Start Practising Now →
                                </a>
                            </div>
                        </div>
                    </RevealSection>
                </Container>
            </section>

            {/* bottom spacing */}
            <div className="h-20" />
        </div>
    );
};

export default AboutPage;
