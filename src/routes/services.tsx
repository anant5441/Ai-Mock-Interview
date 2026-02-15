import { useEffect, useRef, useCallback } from "react";
import Container from "@/components/container";
import {
    BrainCircuit,
    FileSearch,
    Compass,
    MessageSquareText,
    Gauge,
    Layers,
    ArrowRight,
} from "lucide-react";

/* ─── scroll reveal hook ─── */
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
            { threshold: 0.12 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

/* ─── particle background (lightweight) ─── */
function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

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

        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                r: Math.random() * 1.8 + 0.4,
                dx: (Math.random() - 0.5) * 0.25,
                dy: (Math.random() - 0.5) * 0.25,
                o: Math.random() * 0.25 + 0.08,
            });
        }

        const onMouse = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        canvas.parentElement?.addEventListener("mousemove", onMouse);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            for (const p of particles) {
                /* gentle cursor attraction */
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    p.x += dx * 0.002;
                    p.y += dy * 0.002;
                }
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
            canvas.parentElement?.removeEventListener("mousemove", onMouse);
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

/* ─── reusable wrappers ─── */
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

function ServiceCard({
    icon,
    title,
    desc,
    idx,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    idx: number;
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
        <RevealSection delay={`stagger-${idx + 1}`}>
            <div
                ref={cardRef}
                onMouseMove={handleMouse}
                className="glass-card card-glow-overlay p-8 h-full flex flex-col group cursor-default"
            >
                {/* icon */}
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:animate-icon-bounce transition-transform">
                    {icon}
                </div>

                {/* title */}
                <h3 className="text-xl font-semibold mb-3">{title}</h3>

                {/* description */}
                <p className="text-gray-400 leading-relaxed flex-1">{desc}</p>

                {/* hover link */}
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 group-hover:text-white transition-colors">
                    <span className="link-hover">Learn more</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </RevealSection>
    );
}

/* ─── data ─── */
const services = [
    {
        icon: <BrainCircuit className="w-7 h-7" />,
        title: "AI Mock Interviews",
        desc: "Realistic AI-powered mock interviews tailored to your target role, industry, and experience level with instant adaptive questioning.",
    },
    {
        icon: <FileSearch className="w-7 h-7" />,
        title: "Resume Analysis",
        desc: "Deep AI analysis of your resume for keyword optimization, ATS compatibility, and structural improvements that increase callbacks.",
    },
    {
        icon: <Compass className="w-7 h-7" />,
        title: "Career Coaching",
        desc: "Personalised AI guidance on career pivots, skill-gap analysis, and strategic positioning for your dream role in any industry.",
    },
    {
        icon: <MessageSquareText className="w-7 h-7" />,
        title: "Interview Feedback",
        desc: "Detailed, actionable feedback on your answers — covering content relevance, communication clarity, confidence, and body-language cues.",
    },
    {
        icon: <Gauge className="w-7 h-7" />,
        title: "Skill Assessment",
        desc: "Comprehensive competency mapping across technical and behavioural skills with benchmarking against real industry standards.",
    },
    {
        icon: <Layers className="w-7 h-7" />,
        title: "Custom Practice",
        desc: "Build and save tailored practice sessions focusing on your weak areas, unique scenarios, or company-specific interview formats.",
    },
];

/* ─── page ─── */
const ServicesPage = () => {
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden">
            {/* blobs */}
            <div className="floating-blob floating-blob-1 top-[-8%] right-[-6%]" />
            <div className="floating-blob floating-blob-2 bottom-[15%] left-[-5%]" />
            <div className="floating-blob floating-blob-3 top-[50%] right-[10%]" />

            {/* particles */}
            <ParticleBackground />

            {/* ─── HERO ─── */}
            <section className="relative z-10 py-28 md:py-40 text-center">
                <Container>
                    <p
                        className="text-sm tracking-[0.3em] uppercase text-gray-400 mb-4 animate-fadeInUp"
                        style={{ animationDelay: "0.1s" }}
                    >
                        What we offer
                    </p>
                    <h1
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight animate-fadeInUp"
                        style={{ animationDelay: "0.25s" }}
                    >
                        Our{" "}
                        <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                            Services
                        </span>
                    </h1>
                    <p
                        className="mt-6 max-w-2xl mx-auto text-gray-400 text-lg md:text-xl animate-fadeInUp"
                        style={{ animationDelay: "0.45s" }}
                    >
                        A suite of AI-powered tools designed to accelerate your career —
                        from your first practice session to your final job offer.
                    </p>
                </Container>
            </section>

            {/* ─── DIVIDER ─── */}
            <RevealSection>
                <div className="animated-divider expanded max-w-xl mx-auto" />
            </RevealSection>

            {/* ─── SERVICE CARDS ─── */}
            <section className="relative z-10 py-20 md:py-28">
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((s, i) => (
                            <ServiceCard
                                key={s.title}
                                icon={s.icon}
                                title={s.title}
                                desc={s.desc}
                                idx={i}
                            />
                        ))}
                    </div>
                </Container>
            </section>

            {/* ─── CTA ─── */}
            <section className="relative z-10 py-20 md:py-28">
                <Container>
                    <RevealSection>
                        <div className="glass-card p-10 md:p-16 text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Level Up?
                            </h2>
                            <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto">
                                Join hundreds of thousands of professionals who transformed
                                their careers with our AI platform.
                            </p>
                            <a
                                href="/generate"
                                className="inline-block px-8 py-3 rounded-full bg-white text-black font-semibold magnetic-btn glow-border pulse-btn transition-all"
                            >
                                Get Started Free →
                            </a>
                        </div>
                    </RevealSection>
                </Container>
            </section>

            <div className="h-20" />
        </div>
    );
};

export default ServicesPage;
