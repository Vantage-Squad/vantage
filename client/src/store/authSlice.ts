import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus = "idle" | "loading" | "error" | "success";

export interface AuthUser {
    id : string;
    email : string;
    name?: string;
}

export interface AuthState {
    token : string | null;
    user : AuthUser | null ;
    status : AuthStatus;
    errorMessage : string | null ;
}

const initialState : AuthState = {
    token : null,
    user : null,
    status : "idle",
    errorMessage : null,
};

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        setLoading(state) {
            state.status = "loading";
            state.errorMessage = null ;
        },
        setSuccess(state, action: PayloadAction<{token : string; user : AuthUser}>){
            state.status = "success";
            state.token = action.payload.token;
            state.user = action.payload.user ;
            state.errorMessage = null;

        },
        setError(state, action: PayloadAction<string>) {
            state.status = "error";
            state.errorMessage = action.payload;
        },

        setIdle(state) {
            state.status = "idle";
            state.errorMessage = null;
        },
        clearAuth(state) {
            state.token = null;
            state.user = null;
            state.status = "idle";
            state.errorMessage = null;
        },

        //called on app boot to rehydrate from localStorage
        rehydrate(state, action : PayloadAction<{token : string; user : AuthUser}>){
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.status = "idle";
        }
    }
});

export const { setLoading, setSuccess, setError, setIdle, clearAuth, rehydrate } = authSlice.actions;
export default authSlice.reducer;
