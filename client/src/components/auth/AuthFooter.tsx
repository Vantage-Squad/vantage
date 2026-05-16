const AuthFooter = () => {
    return (
        <div className="flex flex-col items-center justify-center mt-8 space-y-2">
            <div className="flex flex-col items-center text-center">
                <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-label)" }}>
                    Fraud Intelligence
                </span>
                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-label)" }}>
                    Unauthorized access is strictly monitored.
                </span>
            </div>
        </div>
    );
};

export default AuthFooter;
