import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import Container  from "./container";
import LogoContainer from "./logo-container";
import { NavigationRoutes } from "./navigation-routes";
import { NavLink } from "react-router-dom";
import ProfileContainer from "./profile-container";
import {ToggleContainer} from "./toggle-container";


const Header = () => {
    const { userId }=useAuth();
    return <header className={cn("w-full border-b ")}>
        <Container>
            <div className="flex gap-4">{/*left side8}
                <div className="max-w-7xl mx-auto flex items-center  px-6 "></div>
                {/* You can add your logo*/}
                <LogoContainer />
                {/*Navigation section */}
                <nav className="hidden md:flex items-center gap-3">
                    <NavigationRoutes />
                    {userId &&(
                        <NavLink
                        to={"/generate"}
                        className={({ isActive }) =>
                            cn(
                            "text-base text-neutral-600",
                            isActive && "text-neutral-900 font-semibold"
                            )
                        }
                        >
                        Take an interview
                        </NavLink>
                    )}
                </nav>
                <div className="ml-auto flex items-center gap-6"></div>
                {/* Profile Section*/}
                <ProfileContainer/>

                {/* Mobile toggle section */}
                <ToggleContainer/> 
            </div>
        </Container>
    </header>
};

export default Header;