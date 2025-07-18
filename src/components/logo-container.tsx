import { Link } from "react-router-dom";

const LogoContainer = () => {
    return (
    <div className="h-0">
        <Link to={"/"}>
            <img src="/svg/logo-ai.png" alt=""  className="w-15 h-12 sm:w-20 sm:h-10 mt-2 "/>
        </Link> 
    </div>
    )
}

export default LogoContainer
