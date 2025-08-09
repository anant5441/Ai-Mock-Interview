import { MainRoutes } from "../lib/helper";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

interface NavigationRoutesProps {
    isMobile?: boolean;
}

export const NavigationRoutes = ({
    isMobile = false,
}: NavigationRoutesProps) => {
    return (
        <ul className={cn("flex items-center gap-6", isMobile && "items-start flex-col gap-8 w-full")}>
            {MainRoutes.map((route: { href: string; label: string }) => (
                <NavLink
                    key={route.href}
                    to={route.href}
                    className={({ isActive }) =>
                        cn(
                            "text-sm md:text-base text-neutral-600 hover:text-neutral-900 transition-colors",
                            isActive && "text-neutral-900 font-semibold"
                        )
                    }
                >
                    {route.label}
                </NavLink>
            ))}
        </ul>
    );
};