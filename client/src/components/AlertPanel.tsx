import { Filter } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { dismissAlert } from "../store/dashboardSlice";
import AlertRow from "./AlertRow";
import LoadingSkeleton from "./LoadingSkeleton";

const AlertPanel = () => {
    const alerts = useAppSelector((state) => state.dashboard.alerts);
    const dispatch = useAppDispatch();

    return (
        <div className="flex flex-col h-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)] shrink-0">
                <span className="text-[var(--font-size-subheading)] font-medium text-[var(--color-text-primary)]">
                    System Alerts
                </span>
                <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                    <Filter size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {alerts.length === 0 ? (
                    <LoadingSkeleton variant="alert" rows={4} />
                ) : (
                    alerts.map((alert) => (
                        <AlertRow 
                            key={alert.id} 
                            alert={alert} 
                            onDismiss={(id) => dispatch(dismissAlert(id))} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertPanel;
