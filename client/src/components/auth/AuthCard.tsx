import type { ReactNode } from "react";

interface AuthCardProps {
    children: ReactNode;
}

const AuthCard = ({ children }: AuthCardProps) => {
    return (
        <>
            <style>
                {`
                    @keyframes slideUpFade {
                        0% { opacity: 0; transform: translateY(8px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
            <div 
                className="w-full max-w-100 p-8 sm:p-10 rounded-xl shadow-2xl flex flex-col"
                style={{ 
                    backgroundColor: "var(--color-bg-card)",
                    border: "1px solid var(--color-outline-variant)",
                    animation: "slideUpFade 250ms ease-out 100ms both"
                }}
            >
                {children}
            </div>
        </>
    );
};

export default AuthCard;
