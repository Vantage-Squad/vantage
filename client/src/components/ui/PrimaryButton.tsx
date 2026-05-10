import { Check } from "lucide-react";
import Spinner from "./Spinner";
import type { AuthStatus } from "../../store/authSlice";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    status: AuthStatus;
}

const PrimaryButton = ({ status, ...props }: PrimaryButtonProps) => {
    const isIdle = status === "idle" || status === "error";
    const isLoading = status === "loading";
    const isSuccess = status === "success";

    const bgColor = isSuccess ? "var(--color-status-safe)" : "var(--color-accent)";
    const hoverScale = isIdle ? "hover:scale-[1.01] hover:brightness-110" : "";
    const cursor = isIdle ? "cursor-pointer" : "cursor-not-allowed opacity-90";

    return (
        <button
            className={`w-full py-2.5 px-4 rounded-md flex items-center justify-center font-medium transition-all duration-180 ease-out text-white ${hoverScale} ${cursor}`}
            style={{ 
                backgroundColor: bgColor,
                fontSize: "var(--font-size-body)"
            }}
            disabled={!isIdle}
            {...props}
        >
            {isLoading && <Spinner />}
            {isSuccess && <Check className="w-5 h-5 mr-2" />}
            
            {isIdle && "Sign in"}
            {isLoading && "Signing in..."}
            {isSuccess && "Authenticated"}
        </button>
    );
};

export default PrimaryButton;
