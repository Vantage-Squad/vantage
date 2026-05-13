import { useAppSelector } from "../store/hooks";
import StatusDot from "./StatusDot";
import type { ReactNode } from "react";

interface AppShellProps {
    children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
    const streamStatus = useAppSelector((state) => state.dashboard?.streamStatus || 'offline');

    return (
        <div className="flex h-screen w-full bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] font-sans">
            {/* Sidebar Placeholder */}
            <aside className="w-[var(--width-sidebar)] shrink-0 h-full bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] flex flex-col">
                <div className="h-[var(--height-topbar)] flex items-center px-6 border-b border-[var(--color-border-subtle)] font-bold tracking-wide">
                    VANTAGE
                </div>
                <div className="p-4 text-[var(--color-text-muted)] text-[var(--font-size-body)]">
                    <p className="mb-2">/dashboard</p>
                    <p className="mb-2">/graph</p>
                    <p>/verdict/:id</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Topbar */}
                <header className="h-[var(--height-topbar)] shrink-0 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] flex items-center justify-between px-6">
                    <span className="text-[var(--font-size-subheading)] font-medium">Sentinel</span>
                    <div className="flex items-center gap-2">
                        <StatusDot status={streamStatus} />
                        <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] uppercase tracking-wider">
                            System Status
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-hidden p-[var(--spacing-lg)]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppShell;
