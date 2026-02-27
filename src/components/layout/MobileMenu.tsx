import { NavLink } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import {
    X,
    LayoutDashboard,
    BarChart3,
    BookOpen,
    FileText,
    ScrollText,
    Home,
    Phone,
    Info,
    Briefcase,
    MessageSquare,
    ExternalLink,
} from "lucide-react";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

interface MobileNavItemProps {
    to: string;
    label: string;
    icon: React.ReactNode;
    onClose: () => void;
    external?: boolean;
}

const MobileNavItem = ({ to, label, icon, onClose, external }: MobileNavItemProps) => {
    if (external) {
        return (
            <a
                href={to}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
            >
                {icon}
                <span className="text-sm font-medium">{label}</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
            </a>
        );
    }

    return (
        <NavLink
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
                    isActive &&
                    "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                )
            }
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </NavLink>
    );
};

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    const { userId } = useAuth();

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed top-0 right-0 z-[70] h-full w-80 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out md:hidden",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Nav */}
                <div className="px-4 py-6 space-y-1 overflow-y-auto h-[calc(100%-72px)]">
                    {/* Public Links */}
                    <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Pages
                    </p>
                    <MobileNavItem to="/" label="Home" icon={<Home className="w-4 h-4" />} onClose={onClose} />
                    <MobileNavItem to="/about" label="About" icon={<Info className="w-4 h-4" />} onClose={onClose} />
                    <MobileNavItem to="/services" label="Services" icon={<Briefcase className="w-4 h-4" />} onClose={onClose} />
                    <MobileNavItem to="/contact" label="Contact" icon={<Phone className="w-4 h-4" />} onClose={onClose} />

                    {userId && (
                        <>
                            <div className="my-3 border-t border-slate-100 dark:border-slate-800" />
                            <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Interview
                            </p>
                            <MobileNavItem to="/generate" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} onClose={onClose} />
                            <MobileNavItem to="/analytics" label="Analytics" icon={<BarChart3 className="w-4 h-4" />} onClose={onClose} />
                            <MobileNavItem to="/question-banks" label="Question Banks" icon={<BookOpen className="w-4 h-4" />} onClose={onClose} />

                            <div className="my-3 border-t border-slate-100 dark:border-slate-800" />
                            <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Career Tools
                            </p>
                            <MobileNavItem to="/cover-letter" label="Cover Letter" icon={<FileText className="w-4 h-4" />} onClose={onClose} />
                            <MobileNavItem
                                to="https://resumeinsight-5441.streamlit.app/"
                                label="Resume Insights"
                                icon={<ScrollText className="w-4 h-4" />}
                                onClose={onClose}
                                external
                            />

                            <div className="my-3 border-t border-slate-100 dark:border-slate-800" />
                            <MobileNavItem to="/feedback" label="Feedback" icon={<MessageSquare className="w-4 h-4" />} onClose={onClose} />
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default MobileMenu;
