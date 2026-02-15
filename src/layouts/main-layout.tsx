import Header from "@/components/header";
import { Outlet } from "react-router-dom";
import Container from "@/components/container";
import { Footer } from "@/components/footer";

export const MainLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20 dark:from-gray-950 dark:to-gray-900">
            <Header />
            <Container className="flex-1">
                <main className="py-6">
                    <Outlet />
                </main>
            </Container>
            <Footer />
        </div>
    );
};