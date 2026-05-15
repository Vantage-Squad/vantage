import { useState } from "react";
import { useAppSelector } from "../store/hooks";
import StatusDot from "./StatusDot";
import TransactionRow from "./TransactionRow";
import AlertBanner from "./AlertBanner";
import LoadingSkeleton from "./LoadingSkeleton";

const LiveFeedPanel = () => {
    const { transactions, streamStatus } = useAppSelector((state) => state.dashboard);
    const [filter, setFilter] = useState<"all" | "highRisk">("all");

    const filteredTransactions = transactions.filter((t) => {
        if (filter === "highRisk") {
            return t.status === "CRITICAL" || t.status === "HIGH_RISK";
        }
        return true;
    });

    return (
        <div className="flex flex-col h-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shrink-0">
                <div className="flex items-center gap-3">
                    <StatusDot status={streamStatus} />
                    <span className="text-[var(--font-size-subheading)] font-medium text-[var(--color-text-primary)]">
                        Live Intelligence Feed
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1.5 text-[var(--font-size-caption)] font-medium rounded transition-colors border ${
                            filter === "all"
                                ? "bg-[var(--color-bg-raised)] border-[var(--color-border-emphasis)] text-[var(--color-text-primary)]"
                                : "bg-transparent border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                        All Nodes
                    </button>
                    <button
                        onClick={() => setFilter("highRisk")}
                        className={`px-3 py-1.5 text-[var(--font-size-caption)] font-medium rounded transition-colors border ${
                            filter === "highRisk"
                                ? "bg-[var(--color-bg-raised)] border-[var(--color-border-emphasis)] text-[var(--color-text-primary)]"
                                : "bg-transparent border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                        High Risk Only
                    </button>
                </div>
            </div>

            {/* Alert Banner */}
            <AlertBanner status={streamStatus} />

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto">
                {transactions.length === 0 ? (
                    <LoadingSkeleton variant="transaction" rows={6} />
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-[var(--color-text-muted)] text-[var(--font-size-body)]">
                        No transactions match the current filter.
                    </div>
                ) : (
                    filteredTransactions.map((t, idx) => (
                        <TransactionRow key={t.id} transaction={t} isNew={idx === 0} />
                    ))
                )}
            </div>
        </div>
    );
};

export default LiveFeedPanel;
