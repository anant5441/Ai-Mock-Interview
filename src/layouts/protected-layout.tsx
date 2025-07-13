import { useAuth } from "@clerk/clerk-react";
import LoaderPage from "@/routes/loader-page"; 
import { Navigate } from "react-router-dom";

interface ProtectedRoutesProps {
    children: React.ReactNode;
}

const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) return <LoaderPage />;

    if (!isSignedIn) return <Navigate to="/signin" replace />; 
    return children; 
};

export default ProtectedRoutes;
