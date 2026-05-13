import type { StreamStatus } from "../types";

interface StatusDotProps {
    status: StreamStatus;
}

const StatusDot = ({ status }: StatusDotProps) => {
    let bgColor = "var(--color-status-danger)";
    let animationClass = "";

    if (status === "live") {
        bgColor = "var(--color-status-safe)";
        animationClass = "animate-ping opacity-75";
    } else if (status === "connecting" || status === "reconnecting") {
        bgColor = "var(--color-status-warning)";
        animationClass = "animate-pulse opacity-75";
    }

    return (
        <div className="relative flex items-center justify-center w-3 h-3">
            {status !== "offline" && (
                <span
                    className={`absolute inline-flex h-full w-full rounded-full ${animationClass}`}
                    style={{ backgroundColor: bgColor }}
                />
            )}
            <span
                className="relative inline-flex rounded-full w-2 h-2"
                style={{ backgroundColor: bgColor }}
            />
        </div>
    );
};

export default StatusDot;
