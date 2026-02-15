import { useEffect, useRef, useState, useCallback } from "react";
import Container from "@/components/container";
import { Mail, Phone, MapPin, Send } from "lucide-react";

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
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

/* ─── particle canvas ─── */
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

        for (let i = 0; i < 45; i++) {
            particles.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                r: Math.random() * 1.5 + 0.4,
                dx: (Math.random() - 0.5) * 0.2,
                dy: (Math.random() - 0.5) * 0.2,
                o: Math.random() * 0.2 + 0.06,
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
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 180) {
                    p.x += dx * 0.0015;
                    p.y += dy * 0.0015;
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

/* ─── contact info card ─── */
function ContactInfoCard({
    icon,
    title,
    lines,
    idx,
}: {
    icon: React.ReactNode;
    title: string;
    lines: string[];
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
                className="glass-card card-glow-overlay p-8 text-center group"
            >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-5 mx-auto group-hover:animate-icon-bounce transition-transform">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                {lines.map((l) => (
                    <p key={l} className="text-gray-400 text-sm">
                        {l}
                    </p>
                ))}
            </div>
        </RevealSection>
    );
}

/* ─── form input ─── */
function FormInput({
    label,
    type = "text",
    name,
    value,
    onChange,
    textarea = false,
}: {
    label: string;
    type?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    textarea?: boolean;
}) {
    const base =
        "w-full px-4 py-3 rounded-xl input-glow text-white placeholder-gray-500 text-sm md:text-base";
    return (
        <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
                {label}
            </label>
            {textarea ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={5}
                    className={`${base} resize-none`}
                    placeholder={`Enter your ${label.toLowerCase()}...`}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={base}
                    placeholder={`Enter your ${label.toLowerCase()}...`}
                />
            )}
        </div>
    );
}

/* ─── page ─── */
const ContactPage = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setForm({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden">
            {/* blobs */}
            <div className="floating-blob floating-blob-1 top-[-5%] left-[10%]" />
            <div className="floating-blob floating-blob-2 bottom-[20%] right-[-8%]" />
            <div className="floating-blob floating-blob-3 top-[60%] left-[-10%]" />

            {/* particles */}
            <ParticleBackground />

            {/* ─── HERO ─── */}
            <section className="relative z-10 py-28 md:py-40 text-center">
                <Container>
                    <p
                        className="text-sm tracking-[0.3em] uppercase text-gray-400 mb-4 animate-fadeInUp"
                        style={{ animationDelay: "0.1s" }}
                    >
                        Get in touch
                    </p>
                    <h1
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight animate-fadeInUp"
                        style={{ animationDelay: "0.25s" }}
                    >
                        Contact{" "}
                        <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                            Us
                        </span>
                    </h1>
                    <p
                        className="mt-6 max-w-2xl mx-auto text-gray-400 text-lg md:text-xl animate-fadeInUp"
                        style={{ animationDelay: "0.45s" }}
                    >
                        Have a question, partnership idea, or just want to say hello? We'd
                        love to hear from you. Drop us a message and we'll get back fast.
                    </p>
                </Container>
            </section>

            {/* ─── DIVIDER ─── */}
            <RevealSection>
                <div className="animated-divider expanded max-w-xl mx-auto" />
            </RevealSection>

            {/* ─── FORM + INFO ─── */}
            <section className="relative z-10 py-20 md:py-28">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                        {/* form */}
                        <RevealSection className="lg:col-span-3">
                            <form
                                onSubmit={handleSubmit}
                                className="glass-card p-8 md:p-12 space-y-6 relative overflow-hidden"
                            >
                                {/* ambient glow behind form */}
                                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                    Send Us a Message
                                </h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    Fill out the form and our team will respond within 24 hours.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput
                                        label="Full Name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                    />
                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <FormInput
                                    label="Subject"
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                />

                                <FormInput
                                    label="Message"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    textarea
                                />

                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-10 py-3 rounded-full bg-white text-black font-semibold magnetic-btn glow-border pulse-btn transition-all flex items-center justify-center gap-2"
                                >
                                    {submitted ? (
                                        "Message Sent ✓"
                                    ) : (
                                        <>
                                            Send Message <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </RevealSection>

                        {/* info cards */}
                        <div className="lg:col-span-2 space-y-6">
                            <ContactInfoCard
                                idx={0}
                                icon={<Mail className="w-6 h-6" />}
                                title="Email"
                                lines={["hello@aimockinterview.com", "support@aimockinterview.com"]}
                            />
                            <ContactInfoCard
                                idx={1}
                                icon={<Phone className="w-6 h-6" />}
                                title="Phone"
                                lines={["+91 98765 43210", "Mon – Fri, 9am – 6pm IST"]}
                            />
                            <ContactInfoCard
                                idx={2}
                                icon={<MapPin className="w-6 h-6" />}
                                title="Office"
                                lines={["41 Omaxe Street", "Noida, UP 201301, India"]}
                            />
                        </div>
                    </div>
                </Container>
            </section>

            <div className="h-20" />
        </div>
    );
};

export default ContactPage;
