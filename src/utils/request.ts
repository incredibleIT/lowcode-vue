import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';

const service = axios.create({
    // baseURL: import.meta.env.VITE_BASE_URL || '/api',  // 在环境中加载url
    baseURL: 'http://127.0.0.1:8080/api',  // 在环境中加载url
    timeout: 10000,  // 超时
})


// 添加请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 在发送请求前做的事情
        // 1. 从localStorage获取token, 并添加到请求头
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, 
    (error: AxiosError) => {
        // 请求拦截器发生错误时做的事情
        console.error("请求拦截器发生错误:", error);
        return Promise.reject(error);
    }
)

// 添加响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const {code, message, data} = response.data;
        return data;
    },
    (error: AxiosError) => {
        // 响应拦截器发生错误时做的事情
        console.error("响应拦截器发生错误:", error);
        return Promise.reject(error);
    }
)

export const http = {
    get<T = any>(url: string, config ?: AxiosRequestConfig): Promise<T> {
        return service.get(url, config);
    },
    post<T = any>(url:string, data?:any, config ?: AxiosRequestConfig): Promise<T> {
        return service.post(url, data, config);
    },
    put<T = any>(url:string, data?:any, config ?: AxiosRequestConfig): Promise<T> {
        return service.put(url, data, config);
    },
    delete<T = any>(url: string, config ?: AxiosRequestConfig): Promise<T> {
        return service.delete(url, config);
    }
}

export default service;
