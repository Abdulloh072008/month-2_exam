import { create } from "zustand"
import { axiosRequest } from "../../utils/Token"

export const useContacts = create(() => ({
    GetContactsZustand: async (folder_id?: string) => {
        try {
            const { data } = await axiosRequest.get("/contacts", {
                params: folder_id ? { folder_id } : {}
            })
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    GetContactByIdZustand: async (id: string) => {
        try {
            const { data } = await axiosRequest.get(`/contacts/${id}`)
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    CreateContactZustand: async (payload: {
        name: string
        folder_id: string
        phone?: string
        email?: string
        notes?: string
    }) => {
        try {
            const { data } = await axiosRequest.post("/contacts", payload)
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    UpdateContactZustand: async (id: string, payload: {
        name?: string
        folder_id?: string
        phone?: string
        email?: string
        notes?: string
    }) => {
        try {
            const { data } = await axiosRequest.patch(`/contacts/${id}`, payload)
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    DeleteContactZustand: async (id: string) => {
        try {
            await axiosRequest.delete(`/contacts/${id}`)
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}))