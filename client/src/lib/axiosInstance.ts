import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError} from "axios"
import { getToken } from "../services/auth";

const axiosInstance = axios.create({
    baseURL : import.meta.env.VITE_API_BASE_URL,
    timeout : 10_000,
    headers : {
        "Content-Type" : "application/json",
    }
});

//attatch jwt to outgoing requests
axiosInstance.interceptors.request.use(
    (config : InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//handles 401 unauthorized globally
axiosInstance.interceptors.response.use(
    (response : AxiosResponse) => response, 
    async (error : AxiosError)=> {
        if (error.response?.status === 401) {
            if (!window.location.pathname.startsWith("/login")) {
                const { logout } = await import("../services/auth");
                await logout();
            }
        }
        return Promise.reject(error);
    }
)

export default axiosInstance ;