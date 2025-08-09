import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NavigationRoutes } from "./navigation-routes";
import { useAuth } from "@clerk/clerk-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export const ToggleContainer = () => {
    const { userId } = useAuth();
    return (
        <Sheet>
        <SheetTrigger className="block md:hidden p-2 rounded-md hover:bg-accent">
            <Menu />
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-96">
            <SheetHeader>
            <SheetTitle className="sr-only">Menu</SheetTitle>
            </SheetHeader>

            <nav className="gap-9 flex flex-col items-start mt-6">
            <NavigationRoutes isMobile />
            {userId && (
                <NavLink
                to={"/generate"}
                className={({ isActive }) =>
                    cn(
                    "text-base text-neutral-600 hover:text-neutral-900 transition-colors",
                    isActive && "text-neutral-900 font-semibold"
                    )
                }
                >
                Take An Interview
                </NavLink>
            )}
            </nav>
        </SheetContent>
        </Sheet>
    );
};
