import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

interface NavItemProps {
    to: string;
    label: string;
    external?: boolean;
    subtle?: boolean;
}

const NavItem = ({ to, label, external, subtle }: NavItemProps) => {
    if (external) {
        return (
            <a
                href={to}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "relative text-sm font-medium transition-colors duration-200 cursor-pointer",
                    "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400",
                    "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-indigo-500 after:transition-all after:duration-300 hover:after:w-full",
                    subtle && "text-slate-500 dark:text-slate-400 text-xs"
                )}
            >
                {label}
            </a>
        );
    }

    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "relative text-sm font-medium transition-colors duration-200",
                    "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400",
                    "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-indigo-500 after:transition-all after:duration-300 hover:after:w-full",
                    isActive && "text-indigo-600 dark:text-indigo-400 font-semibold after:w-full",
                    subtle && "text-slate-500 dark:text-slate-400 text-xs"
                )
            }
        >
            {label}
        </NavLink>
    );
};

export default NavItem;
