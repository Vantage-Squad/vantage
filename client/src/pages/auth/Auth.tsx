import AuthCard from "../../components/auth/AuthCard";
import AuthForm from "../../components/auth/AuthForm";
import AuthFooter from "../../components/auth/AuthFooter";
import VantageLogo from "../../components/logo/VantageLogo";

const Auth = () => {
    return (
        <div 
            className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6"
            style={{ backgroundColor: "var(--color-bg-canvas)" }}
        >
            <AuthCard>
                <VantageLogo />
                <AuthForm />
                <AuthFooter />
            </AuthCard>
        </div>
    );
};

export default Auth;