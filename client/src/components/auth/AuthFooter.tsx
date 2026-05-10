const AuthFooter = () => {
    return (
        <div className="flex flex-col items-center justify-center mt-8 space-y-2">
            <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-status-safe)" }} />
                <span 
                    className="uppercase font-medium tracking-widest"
                    style={{ 
                        color: "var(--color-text-muted)", 
                        fontSize: "9px" 
                    }}
                >
                    SYSTEM STATUS: OPTIMAL
                </span>
            </div>
            
            <div className="flex flex-col items-center text-center">
                <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-label)" }}>
                    Fraud Intelligence Node #4829
                </span>
                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-label)" }}>
                    Unauthorized access is strictly monitored.
                </span>
            </div>
        </div>
    );
};

export default AuthFooter;
