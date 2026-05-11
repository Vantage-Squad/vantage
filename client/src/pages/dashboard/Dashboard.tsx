import { logout } from "../../services/auth";
import { useAppSelector } from "../../store/hooks";

const Dashboard = () => {
    const user = useAppSelector((s) => s.auth.user);

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--color-bg-canvas, #0d0d0f)",
                gap: "24px",
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            <div
                style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "48px 56px",
                    textAlign: "center",
                    maxWidth: "480px",
                    width: "100%",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                }}
            >
                {/* Status badge */}
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(34, 197, 94, 0.12)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: "999px",
                        padding: "6px 14px",
                        marginBottom: "32px",
                    }}
                >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                    <span style={{ color: "#22c55e", fontSize: "13px", fontWeight: 500, letterSpacing: "0.04em" }}>
                        AUTHENTICATED
                    </span>
                </div>

                <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                    Vantage Dashboard
                </h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: "0 0 32px 0" }}>
                    Under construction — coming soon.
                </p>

                <div
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                        padding: "16px 20px",
                        marginBottom: "32px",
                        textAlign: "left",
                    }}
                >
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", margin: "0 0 6px 0" }}>
                        SIGNED IN AS
                    </p>
                    <p style={{ color: "#fff", fontSize: "15px", fontWeight: 500, margin: 0 }}>
                        {user?.email ?? "—"}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", margin: "4px 0 0 0", fontFamily: "monospace" }}>
                        id: {user?.id ?? "—"}
                    </p>
                </div>

                <button
                    onClick={logout}
                    style={{
                        width: "100%",
                        padding: "13px",
                        background: "transparent",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        borderRadius: "10px",
                        color: "#ef4444",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        letterSpacing: "0.02em",
                        transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                    }}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
