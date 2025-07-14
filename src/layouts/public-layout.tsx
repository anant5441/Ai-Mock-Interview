import Header from "@/components/header";
import { Outlet } from "react-router-dom";
import AuthHandler from "@/handlers/auth-handler";
import { Footer } from "@/components/footer";

export const PublicLayout = () => {
    return (
        <div className="w-full">
        {/* handler to store the user data */}
        <AuthHandler />
        <Header />

        <Outlet/>

        <Footer />
        </div>
    );
};