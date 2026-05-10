import { Routes, Route, Navigate } from "react-router";
import Auth from "./pages/auth/Auth";

function App() {


  return (
    <Routes>
      <Route path="/" element={<Navigate to="auth" />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  )
}

export default App
