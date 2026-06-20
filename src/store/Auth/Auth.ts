import { create } from "zustand"
import { axiosRequest, getRefreshToken, removeTokens, saveTokens } from "../../utils/Token";

export const useAuth = create(() => ({
    user: null,

    LoginZustand: async (datas) => {
        try {
            const { data } = await axiosRequest.post("/auth/login", datas)
            saveTokens(data.accessToken, data.refreshToken)
            console.log(data);
            return data
        } catch (error) {
            console.log(error);
            throw error
        }
    },

    RegisterZustand: async (datas) => {
        try {
            const { data } = await axiosRequest.post("/auth/register", datas)
            saveTokens(data.accessToken, data.refreshToken)
            return data
        } catch (error) {
            console.log(error);
            throw error
        }
    },

    LogoutZustand: async () => {
        try {
            const refreshToken = getRefreshToken()
            const { data } = await axiosRequest.post("/auth/logout", { refreshToken })
            return data
        } catch (error) {
            console.log(error);
            throw error
        } finally {
            removeTokens()
        }
    }
}))