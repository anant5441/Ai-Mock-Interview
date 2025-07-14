import { Link } from "react-router-dom";

const LogoContainer = () => {
    return (
    <div>
        <Link to={"/"}>
            <img src="/svg/logo.svg" alt=""  className="min-w-10 min-h-10 object-contain"/>
        </Link> 
    </div>
    )
}

export default LogoContainer
