import { create } from "zustand"
import { axiosRequest } from "../../utils/Token"

export const useFolders = create(() => ({
    GetFoldersZustand: async () => {
        try {
            const { data } = await axiosRequest.get("/folders")
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    GetFolderByIdZustand: async (id: string) => {
        try {
            const { data } = await axiosRequest.get(`/folders/${id}`)
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    CreateFolderZustand: async (name: string) => {
        try {
            const { data } = await axiosRequest.post("/folders", { name })
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    UpdateFolderZustand: async (id: string, name: string) => {
        try {
            const { data } = await axiosRequest.patch(`/folders/${id}`, { name })
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    DeleteFolderZustand: async (id: string) => {
        try {
            await axiosRequest.delete(`/folders/${id}`)
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}))