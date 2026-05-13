import type { StreamStatus } from "../types";
import { AlertTriangle, WifiOff } from "lucide-react";

interface AlertBannerProps {
    status: StreamStatus;
}

const AlertBanner = ({ status }: AlertBannerProps) => {
    if (status === "live" || status === "connecting") return null;

    const isReconnecting = status === "reconnecting";
    const bgColor = isReconnecting ? "var(--color-status-warning-subtle)" : "var(--color-status-danger-subtle)";
    const textColor = isReconnecting ? "var(--color-status-warning)" : "var(--color-status-danger)";
    const borderColor = isReconnecting ? "var(--color-status-warning-border)" : "var(--color-status-danger-border)";
    const Icon = isReconnecting ? AlertTriangle : WifiOff;
    const message = isReconnecting
        ? "Stream disconnected — attempting to reconnect…"
        : "Stream offline. Refresh to retry.";

    return (
        <div
            className="flex items-center gap-3 p-3 w-full border-b"
            style={{
                backgroundColor: bgColor,
                borderColor: borderColor,
                color: textColor
            }}
        >
            <Icon size={18} />
            <span className="text-[var(--font-size-body)] font-medium">
                {message}
            </span>
        </div>
    );
};

export default AlertBanner;
