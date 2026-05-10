import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError} from "axios"


const axiosInstance = axios.create({
    baseURL : import.meta.env.VITE_API_BASE_URL,
    timeout : 10_000,
    headers : {
        "Content-Type" : "application/json",
    }
})

export default axiosInstance ;