import type { TransactionStatus } from "../types";

interface StatusBadgeProps {
    status: TransactionStatus;
    label?: string;
}

const StatusBadge = ({ status, label }: StatusBadgeProps) => {
    let bg = "";
    let border = "";
    let text = "";

    switch (status) {
        case "CRITICAL":
            bg = "var(--color-status-danger-subtle)";
            border = "var(--color-status-danger-border)";
            text = "var(--color-status-danger)";
            break;
        case "HIGH_RISK":
            bg = "var(--color-status-warning-subtle)";
            border = "var(--color-status-warning-border)";
            text = "var(--color-status-warning)";
            break;
        case "SAFE":
        default:
            bg = "var(--color-status-safe-subtle)";
            border = "var(--color-status-safe-border)";
            text = "var(--color-status-safe)";
            break;
    }

    const displayText = label || (status === "HIGH_RISK" ? "HIGH-RISK" : status);

    return (
        <span
            className="inline-flex items-center justify-center border"
            style={{
                backgroundColor: bg,
                borderColor: border,
                color: text,
                fontSize: "var(--font-size-label)",
                fontWeight: "var(--font-weight-medium)",
                letterSpacing: "var(--letter-spacing-label)",
                borderRadius: "var(--radius-full)",
                padding: "4px 10px",
            }}
        >
            {displayText}
        </span>
    );
};

export default StatusBadge;
