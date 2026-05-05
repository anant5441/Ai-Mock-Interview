import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Menu, ChevronDown, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import NavItem from "./NavItem";
import MobileMenu from "./MobileMenu";
import ProfileContainer from "@/components/profile-container";
import { ThemeToggle } from "@/components/theme-toggle";

const Header = () => {
    const { userId } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [careerDropdownOpen, setCareerDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setCareerDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <header
                className={cn(
                    "sticky top-0 z-50 w-full",
                    "bg-white/70 dark:bg-slate-900/70",
                    "backdrop-blur-xl",
                    "border-b border-slate-200/50 dark:border-white/10",
                    "shadow-sm dark:shadow-none"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex h-16 items-center justify-between">
                        {/* ── LEFT: Logo + Brand ── */}
                        <Link
                            to="/"
                            className="flex items-center gap-2.5 shrink-0 group"
                        >
                            <img
                                src="/svg/logo-ai.png"
                                alt="AI Mock Interview"
                                className="w-20 h-9 rounded-lg transition-transform duration-200 group-hover:scale-105"
                            />
                            <span className="hidden sm:block text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                AI Mock Interview
                            </span>
                        </Link>

                        {/* ── CENTER: Navigation ── */}
                        <nav className="hidden lg:flex items-center gap-1">
                            <div className="flex items-center gap-5 mr-6">
                                <NavItem to="/" label="Home" subtle />
                                <NavItem to="/about" label="About" subtle />
                                <NavItem to="/services" label="Services" subtle />
                                <NavItem to="/contact" label="Contact" subtle />
                            </div>

                            {userId && (
                                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-2" />
                            )}

                            {userId && (
                                <div className="flex items-center gap-5 ml-2">
                                    <NavItem to="/generate" label="Interview" />
                                    <NavItem to="/analytics" label="Analytics" />
                                    <NavItem to="/question-banks" label="Question Banks" />

                                    {/* Career Tools Dropdown */}
                                    <div
                                        ref={dropdownRef}
                                        className="relative py-2" // Added padding to bridge the gap
                                        onMouseEnter={() => setCareerDropdownOpen(true)}
                                        onMouseLeave={() => setCareerDropdownOpen(false)}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setCareerDropdownOpen((prev) => !prev)}
                                            className={cn(
                                                "flex items-center gap-1 text-sm font-medium transition-colors duration-200 cursor-pointer",
                                                "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400",
                                                careerDropdownOpen && "text-indigo-600 dark:text-indigo-400"
                                            )}
                                        >
                                            Career Tools
                                            <ChevronDown
                                                className={cn(
                                                    "w-3.5 h-3.5 transition-transform duration-200",
                                                    careerDropdownOpen && "rotate-180"
                                                )}
                                            />
                                        </button>

                                        {/* Dropdown panel */}
                                        <div
                                            className={cn(
                                                "absolute top-full left-1/2 -translate-x-1/2 w-56",
                                                "bg-white dark:bg-slate-800 backdrop-blur-xl",
                                                "rounded-xl shadow-2xl",
                                                "border border-slate-100 dark:border-slate-700",
                                                "transition-all duration-200 origin-top",
                                                // Simplified visibility logic
                                                careerDropdownOpen
                                                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                            )}
                                        >
                                            <div className="p-2">
                                                <Link
                                                    to="/cover-letter"
                                                    onClick={() => setCareerDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                >
                                                    <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                                                        <span className="text-base">📝</span>
                                                    </span>
                                                    <div>
                                                        <p className="font-medium">Cover Letter</p>
                                                        <p className="text-xs text-slate-400">Generate tailored letters</p>
                                                    </div>
                                                </Link>
                                                <a
                                                    href="https://resumeinsight-5441.streamlit.app/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => setCareerDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                >
                                                    <span className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                                                        <span className="text-base">📄</span>
                                                    </span>
                                                    <div>
                                                        <p className="font-medium">Resume Insights</p>
                                                        <p className="text-xs text-slate-400">AI-powered analysis</p>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </nav>

                        {/* ── RIGHT: Actions ── */}
                        <div className="flex items-center gap-1.5">
                            <ThemeToggle />
                            {userId && (
                                <Link
                                    to="/feedback"
                                    className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="Feedback"
                                >
                                    <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                </Link>
                            )}
                            <div className="ml-1">
                                <ProfileContainer />
                            </div>
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                                aria-label="Open menu"
                            >
                                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        </>
    );
};

export default Header;