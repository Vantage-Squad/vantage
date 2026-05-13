import type { Alert } from "../types";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";

interface AlertRowProps {
    alert: Alert;
    onDismiss: (id: string) => void;
}

const AlertRow = ({ alert, onDismiss }: AlertRowProps) => {
    let color = "var(--color-text-muted)";
    let Icon = Info;

    if (alert.severity === "critical") {
        color = "var(--color-status-danger)";
        Icon = AlertCircle; // Or circle-slash, but AlertCircle is common for critical
    } else if (alert.severity === "warning") {
        color = "var(--color-status-warning)";
        Icon = AlertTriangle;
    } else {
        color = "var(--color-accent)";
    }

    return (
        <div
            className="flex flex-col bg-[var(--color-bg-card)] border-y border-r border-[var(--color-border-subtle)] p-4 relative hover:bg-[var(--color-bg-raised)] transition-colors group"
        >
            {/* Left border accent */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{ backgroundColor: color }}
            />

            <div className="flex gap-3">
                <div className="shrink-0 pt-0.5">
                    <Icon size={18} style={{ color }} />
                </div>
                
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[var(--font-size-body)] font-medium text-[var(--color-text-primary)] truncate">
                            {alert.title}
                        </span>
                        <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] whitespace-nowrap pt-0.5">
                            {alert.timestamp}
                        </span>
                    </div>
                    
                    <p className="text-[var(--font-size-caption)] text-[var(--color-text-secondary)] leading-snug mb-3">
                        {alert.description}
                    </p>

                    {/* Actions */}
                    {alert.actions && alert.actions.length > 0 && (
                        <div className="flex items-center gap-2 mt-auto">
                            {alert.actions.map((action, idx) => {
                                const isDanger = action.label === "Freeze";
                                const isGhost = action.variant === "ghost";

                                let btnClass = "text-[var(--font-size-caption)] font-medium rounded px-3 py-1.5 transition-colors ";
                                
                                if (isDanger) {
                                    btnClass += "bg-[var(--color-status-danger-subtle)] text-[var(--color-status-danger)] hover:bg-[var(--color-status-danger)] hover:text-white";
                                } else if (isGhost) {
                                    btnClass += "bg-transparent border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-raised)] hover:text-[var(--color-text-primary)]";
                                } else {
                                    btnClass += "bg-[var(--color-accent)] text-white hover:opacity-90";
                                }

                                return (
                                    <button
                                        key={idx}
                                        className={btnClass}
                                        onClick={() => {
                                            if (action.label === "Dismiss") {
                                                onDismiss(alert.id);
                                            }
                                        }}
                                    >
                                        {action.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Dismiss Icon (top right, visible on hover) */}
                {!alert.actions?.find(a => a.label === "Dismiss") && (
                    <button 
                        onClick={() => onDismiss(alert.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] -mt-1 -mr-1"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default AlertRow;
