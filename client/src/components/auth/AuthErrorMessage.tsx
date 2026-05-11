interface AuthErrorMessageProps {
    message: string | null;
    status: string;
}

const AuthErrorMessage = ({ message, status }: AuthErrorMessageProps) => {
    if (status !== "error" || !message) return null;

    return (
        <>
            <style>
                {`
                    @keyframes slideDownFade {
                        0% { opacity: 0; transform: translateY(-4px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
            <div 
                className="flex items-center space-x-2 mt-3 mb-1"
                style={{
                    animation: "slideDownFade 180ms ease-out both"
                }}
            >
                <div 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: "var(--color-status-danger)" }}
                />
                <span 
                    style={{ 
                        color: "var(--color-status-danger)",
                        fontSize: "var(--font-size-caption)",
                        lineHeight: "var(--line-height-caption)"
                    }}
                >
                    {message}
                </span>
            </div>
        </>
    );
};

export default AuthErrorMessage;
