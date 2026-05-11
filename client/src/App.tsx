import { Routes, Route, Navigate } from "react-router";
import { useAppSelector } from "./store/hooks";
import Auth from "./pages/auth/Auth";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const token = useAppSelector((s) => s.auth.token);

  return (
    <Routes>
      {/* Root: send authenticated users to dashboard, others to auth */}
      <Route path="/" element={<Navigate to={token ? "/dashboard" : "/auth"} replace />} />

      {/* Public: redirect away if already logged in */}
      <Route
        path="/auth"
        element={token ? <Navigate to="/dashboard" replace /> : <Auth />}
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
