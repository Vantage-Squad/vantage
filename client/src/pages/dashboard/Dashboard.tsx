import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { incomingTransaction, incomingAlert } from "../../store/dashboardSlice";
import { sseService } from "../../lib/sseService";
import LiveFeedPanel from "../../components/LiveFeedPanel";
import AlertPanel from "../../components/AlertPanel";
import MetricCard from "../../components/MetricCard";
import { Sparkles, Plus, CheckCircle2 } from "lucide-react";

const Dashboard = () => {
    const dispatch = useAppDispatch();
    const metrics = useAppSelector((state) => state.dashboard.metrics);

    useEffect(() => {
        sseService.start(
            (t) => dispatch(incomingTransaction(t)),
            (a) => dispatch(incomingAlert(a))
        );
        return () => sseService.stop();
    }, [dispatch]);

    return (
        <div className="flex h-full gap-[var(--spacing-lg)]">
            {/* Left Column */}
            <div className="w-[60%] h-full flex flex-col">
                <LiveFeedPanel />
            </div>

            {/* Right Column */}
            <div className="w-[40%] h-full flex flex-col gap-[var(--spacing-lg)]">
                
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 shrink-0">
                    <div className="col-span-2">
                        <MetricCard 
                            label="FLAGGED TODAY" 
                            value={metrics.flagged} 
                            delta={metrics.flaggedDelta} 
                            deltaPositive={false}
                            accentColor="var(--color-status-danger)"
                        >
                            <div className="w-full max-w-[120px] h-1 bg-[var(--color-bg-raised)] rounded-full overflow-hidden self-end mb-1">
                                <div className="h-full w-[65%] bg-[var(--color-status-danger)]" />
                            </div>
                        </MetricCard>
                    </div>
                    <MetricCard 
                        label="UNDER WATCH" 
                        value={new Intl.NumberFormat().format(metrics.watch)} 
                        accentColor="var(--color-status-warning)"
                    />
                    <MetricCard 
                        label="CLEARED" 
                        value={new Intl.NumberFormat().format(metrics.cleared)} 
                        accentColor="var(--color-status-safe)"
                    >
                        <CheckCircle2 size={16} color="var(--color-status-safe)" />
                    </MetricCard>
                </div>

                {/* Alerts */}
                <div className="flex-1 min-h-0">
                    <AlertPanel />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:opacity-90 transition-opacity text-white rounded-[var(--radius-default)] py-3 font-medium text-[var(--font-size-body)] tracking-wide">
                        <Sparkles size={18} />
                        RUN AI AUDIT
                    </button>
                    <button className="w-[48px] h-[48px] flex items-center justify-center rounded-[var(--radius-default)] bg-[var(--color-bg-raised)] border border-[var(--color-border-emphasis)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors shrink-0">
                        <Plus size={20} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
