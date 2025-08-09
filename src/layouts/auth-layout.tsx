import { Outlet } from "react-router-dom";

const AuthenticationLayout = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <img
        src="/svg/logo-ai.png"
        className="absolute inset-0 w-full h-full object-cover opacity-10"
        alt="AI background"
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-card/80 backdrop-blur p-6 shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthenticationLayout;