import Header from "@/components/header";
import { Outlet } from "react-router-dom";
import AuthHandler from "@/handlers/auth-handler";
import { Footer } from "@/components/footer";

export const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        {/* handler to store the user data */}
        <AuthHandler />
        <Header />
        <div className="flex-1">
            <Outlet />
        </div>
        <Footer />
        </div>
    );
};