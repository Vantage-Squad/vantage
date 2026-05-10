import { store } from "../store/store";
import { setLoading, setSuccess, setError, clearAuth, rehydrate, type AuthUser } from "../store/authSlice"
import axiosInstance from "../lib/axiosInstance";
import { isAxiosError } from "axios";


//storage keys
const TOKEN_KEY = "vantage_token";
const USER_KEY = "vantage_token";

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


export async function login(email: string, password: string): Promise<void> {
    store.dispatch(setLoading());

    try {
        const { data } = await axiosInstance.post<{ token: string; user: AuthUser }>(
            "/api/auth/login",
            { email, password }
        );
        //persist before dispatching
        saveSession(data.token, data.user);
        store.dispatch(setSuccess({ token: data.token, user: data.user }));


    } catch (err: unknown) {
        const message = isAxiosError(err) && err.response?.status === 401
            ? "Invalid email or password. Please try again"
            : "something went wrong. Please try again.";

        store.dispatch(setError(message));
    }
}


export async function logout(): Promise<void> {
    try {
        const { stopSSE } = await import("./sseClient");
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

