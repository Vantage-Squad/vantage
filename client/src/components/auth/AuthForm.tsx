import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../store/hooks";
import { login } from "../../services/auth";
import InputField from "../ui/InputField";
import PasswordInput from "../ui/PasswordInput";
import PrimaryButton from "../ui/PrimaryButton";
import AuthErrorMessage from "./AuthErrorMessage";

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const { status, errorMessage } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (status === "success") {
            const timer = setTimeout(() => navigate("/"), 600);
            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email, password);
    };

    const isBusy = status === "loading" || status === "success";
    const hasError = status === "error";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col mt-8 w-full">
            <InputField 
                label="EMAIL ADDRESS" 
                type="email"
                placeholder="admin@vantage.ai"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={hasError}
                disabled={isBusy}
                required
            />
            
            <PasswordInput 
                label="PASSWORD" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={hasError}
                disabled={isBusy}
                hideToggle={isBusy}
                required
            />

            <AuthErrorMessage status={status} message={errorMessage} />
            
            <div className="mt-6">
                <PrimaryButton type="submit" status={status} />
            </div>
        </form>
    );
};

export default AuthForm;
