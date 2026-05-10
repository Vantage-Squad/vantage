import { Routes, Route, Navigate } from "react-router";
import Auth from "./pages/auth/Auth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="auth" />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
