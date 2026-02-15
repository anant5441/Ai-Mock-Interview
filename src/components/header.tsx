import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import Container from "./container";
import LogoContainer from "./logo-container";
import { NavigationRoutes } from "./navigation-routes";
import { NavLink } from "react-router-dom";
import ProfileContainer from "./profile-container";
import { ToggleContainer } from "./toggle-container";
import { ThemeToggle } from "./theme-toggle";

const Header = () => {
  const { userId } = useAuth();
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-gray-950/80 dark:border-gray-800"
      )}
    >
      <Container className="py-0">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <LogoContainer />

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavigationRoutes />
            {userId && (
              <NavLink
                to={"/generate"}
                className={({ isActive }) =>
                  cn(
                    "text-sm md:text-base text-neutral-600 hover:text-neutral-900 transition-colors",
                    isActive && "text-neutral-900 font-semibold"
                  )
                }
              >
                Take an interview
              </NavLink>
            )}
            {userId && (
              <NavLink
                to={"/analytics"}
                className={({ isActive }) =>
                  cn(
                    "text-sm md:text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors",
                    isActive && "text-neutral-900 dark:text-white font-semibold"
                  )
                }
              >
                Analytics
              </NavLink>
            )}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <ProfileContainer />
            {/* Mobile menu */}
            <ToggleContainer />
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;