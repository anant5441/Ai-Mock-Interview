import { Outlet } from "react-router-dom";

const AuthenticationLayout = () => {
    return( <div>
        <div className="w-Screen h-screen overflow-hidden flex justify-center items-center relative">
            <img src="/img/bg.png" className="absolute w-full h-full object-cover opacity-20" alt="" />
        <Outlet />
        </div>
    </div>
    );
};

export default AuthenticationLayout;