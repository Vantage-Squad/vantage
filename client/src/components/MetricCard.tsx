import type { ReactNode } from "react";

interface MetricCardProps {
    label: string;
    value: number | string;
    delta?: string;
    deltaPositive?: boolean;
    accentColor?: string;
    children?: ReactNode;
}

const MetricCard = ({ label, value, delta, deltaPositive, accentColor, children }: MetricCardProps) => {
    return (
        <div
            className="flex flex-col p-4 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] overflow-hidden relative"
            style={{ borderRadius: "var(--radius-md)" }}
        >
            {/* Optional Left Border Accent */}
            {accentColor && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: accentColor }}
                />
            )}

            <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--font-size-caption)] text-[var(--color-text-secondary)] font-medium tracking-wider uppercase">
                    {label}
                </span>
                {children /* For icons or custom elements like the checkmark */}
            </div>

            <span className="text-[var(--font-size-display)] text-[var(--color-text-primary)] font-bold mb-1 tracking-tight">
                {value}
            </span>

            {delta && (
                <span
                    className="text-[var(--font-size-caption)] font-medium"
                    style={{
                        color: deltaPositive
                            ? "var(--color-status-safe)"
                            : "var(--color-status-danger)",
                    }}
                >
                    {delta}
                </span>
            )}
        </div>
    );
};

export default MetricCard;
