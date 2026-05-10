import { Shield } from "lucide-react";

const VantageLogo = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6" style={{ color: "var(--color-text-primary)" }} />
                <span 
                    className="font-bold tracking-wide" 
                    style={{ 
                        color: "var(--color-text-primary)", 
                        fontSize: "var(--font-size-heading)",
                        letterSpacing: "0.05em"
                    }}
                >
                    VANTAGE
                </span>
            </div>
            <span 
                style={{ 
                    color: "var(--color-text-secondary)", 
                    fontSize: "var(--font-size-label)",
                    letterSpacing: "var(--letter-spacing-label)"
                }}
            >
                Secure admin access
            </span>
        </div>
    );
};

export default VantageLogo;
