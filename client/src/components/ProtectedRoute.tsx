import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { isTokenValid, rehydrateAuth } from "../services/auth";
import { useAppSelector } from "../store/hooks";


interface ProtectedRouteProps {
    children : React.ReactNode;
}


const ProtectedRoute =  ( { children } : ProtectedRouteProps) => {


    const token  = useAppSelector((s) => s.auth.token );
    const [checking, setChecking] = useState(!token);


    useEffect(() => {
        if (!token) {
            rehydrateAuth();
        }
        setChecking(false);
    }, [])

    if (checking) {
        return null;
    }

    if (!token || !isTokenValid(token)) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <>
        {children}
        </>
    );
}

export default ProtectedRoute ;