import { store } from "../store/store";
import { setLoading, setSuccess, setError, clearAuth, rehydrate, type AuthUser } from "../store/authSlice"
import axiosInstance from "../lib/axiosInstance";
import { isAxiosError } from "axios";


//storage keys
const TOKEN_KEY = "vantage_token";
const USER_KEY  = "vantage_user";

//token storage
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

function saveSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

//token validation
export function isTokenValid(token?: string | null): boolean {
    const t = token ?? getToken();
    if (!t) return false;

    try {
        const payload = JSON.parse(
            atob(t.split(".")[1].replace(/-/g, "+")).replace(/_/g, "/")
        );

        return payload.exp * 1000 > Date.now() + 30_000;
    } catch {
        //treat malformed token as invalid
        return false;
    }
}

export function rehydrateAuth(): void {
    const token = getToken();
    const userRaw = localStorage.getItem(USER_KEY);

    if (token && userRaw && isTokenValid(token)) {
        try {
            const user: AuthUser = JSON.parse(userRaw);
            store.dispatch(rehydrate({ token, user }))
        } catch {
            //corrupted user data
            clearSession();
        }
    } else {
        //token missing or expired
        clearSession();
    }
}


// Decode user identity from the JWT payload (sub + email + optional name)
function decodeJwtUser(token: string): AuthUser | null {
    try {
        const raw = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(raw));
        if (!payload.sub || !payload.email) return null;

        // Try common JWT name claims, fall back to email prefix
        const rawName: string =
            payload.name ||
            payload.username ||
            payload.preferred_username ||
            payload.email.split("@")[0];

        // Capitalise each word so "john_doe" → "John Doe"
        const name = rawName
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase())
            .trim();

        return { id: payload.sub, email: payload.email, name };
    } catch {
        return null;
    }
}

export async function login(email: string, password: string): Promise<void> {
    store.dispatch(setLoading());

    try {
        const { data } = await axiosInstance.post<{ token: string; expiresIn: number }>(
            "/api/v1/admin/login",
            { email, password }
        );

        const user = decodeJwtUser(data.token);
        if (!user) throw new Error("Malformed token received from server");

        //persist before dispatching
        saveSession(data.token, user);
        store.dispatch(setSuccess({ token: data.token, user }));

    } catch (err: unknown) {
        const message = isAxiosError(err) && err.response?.status === 401
            ? "Invalid email or password. Please try again"
            : "Something went wrong. Please try again.";

        store.dispatch(setError(message));
    }
}


export async function logout(): Promise<void> {
    try {
        const { stopSSE } = await import("../lib/sseService");
        stopSSE();

    } catch {
        //ignore for now
    }

    clearSession();
    store.dispatch(clearAuth());

    window.location.href = "/auth";
}

// function isAxiosError (err : unknown) :
// err is { response? : {status?: number; data?: unknown}} {
//     return  typeof err === "object" && err !== null && "response" in err;
// }

