import { useAppSelector } from "../store/hooks";
import StatusDot from "./StatusDot";
import VerdictModal from "./VerdictModal";
import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { LayoutDashboard, Network, ShieldAlert } from "lucide-react";
import type { AuthUser } from "../store/authSlice";


interface AppShellProps {
    children: ReactNode;
}

function getInitial(user: AuthUser | null): string {
    if (!user) return "?";
    if (user.name) return user.name.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
}

function getDisplayName(user: AuthUser | null): string {
    if (!user) return "";
    return user.name ?? user.email;
}

const AppShell = ({ children }: AppShellProps) => {
    const streamStatus = useAppSelector((state) => state.dashboard?.streamStatus || 'offline');
    const user = useAppSelector((state) => state.auth?.user ?? null);

    return (
        <div className="flex h-screen w-full bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] font-sans">
            {/* Sidebar */}
            <aside className="w-[var(--width-sidebar)] shrink-0 h-full bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] flex flex-col">
                <div className="pt-8 pb-4 px-6 flex flex-col">
                    <span className="font-bold tracking-wide text-[var(--color-text-primary)]">VANTAGE</span>
                    <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] mt-0.5">Fraud Intelligence</span>
                </div>
                
                <nav className="flex-1 py-6 flex flex-col gap-1 px-3">
                    <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-canvas)]'}`}>
                        <LayoutDashboard size={18} />
                        <span className="text-[var(--font-size-body)]">Dashboard</span>
                    </NavLink>
                    <NavLink to="/network-forensic" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-canvas)]'}`}>
                        <Network size={18} />
                        <span className="text-[var(--font-size-body)]">Network Forensic</span>
                    </NavLink>

                    <NavLink to="/flagged-accounts" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-canvas)]'}`}>
                        <ShieldAlert size={18} />
                        <span className="text-[var(--font-size-body)]">Flagged Accounts</span>
                    </NavLink>
                </nav>

                <div className="p-3 mt-auto border-t border-[var(--color-border-subtle)] flex items-center gap-2.5 cursor-pointer hover:bg-[var(--color-bg-raised)] transition-colors rounded-b-sm">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-semibold select-none"
                        style={{ background: 'linear-gradient(135deg, var(--color-accent), #7c3aed)', fontSize: '0.8125rem' }}
                    >
                        {getInitial(user)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[var(--font-size-label)] font-medium text-[var(--color-text-primary)] truncate leading-tight">{getDisplayName(user)}</span>
                        <span className="text-[0.625rem] text-[var(--color-text-muted)] truncate leading-tight">{user?.email ?? ''}</span>
                    </div>
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

            {/* Global Verdict Modal — rendered above everything, available on every route */}
            <VerdictModal />
        </div>
    );
};

export default AppShell;
