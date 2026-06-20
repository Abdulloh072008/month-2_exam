import axios from "axios"

export const saveTokens = (access, refresh) => {
    localStorage.setItem("access", access)
    localStorage.setItem("refresh", refresh)
}

export const getToken = () => {
    return localStorage.getItem("access")
}

export const getRefreshToken = () => {
    return localStorage.getItem("refresh")
}

export const axiosRequest = axios.create({
    baseURL: import.meta.env.VITE_API
})

export const removeTokens = () => {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
}

axiosRequest.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

  axiosRequest.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API}/api/auth/refresh`,
                    { refreshToken }
                );

                saveTokens(data.accessToken, data.refreshToken);

                originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
                return axiosRequest(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = "/"; 
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);