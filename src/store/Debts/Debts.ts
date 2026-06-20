import { create } from "zustand"
import { axiosRequest } from "../../utils/Token"
import { useDashboard } from "../Dashboard/Dashboard"

export const useDebts = create(() => ({
    GetDebtsZustand: async (params) => {
        try {
            const { data } = await axiosRequest.get("/debts", { params })
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    GetDebtByIdZustand: async (id) => {
        try {
            const { data } = await axiosRequest.get(`/debts/${id}`)
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    CreateDebtZustand: async (payload: {
        contact_id: string
        direction: 'i_owe_them' | 'they_owe_me'
        amount: number
        currency: string
        description?: string
        due_date?: string
    }) => {
        try {
            const { data } = await axiosRequest.post("/debts", payload)
            useDashboard.getState().fetchDashboard()
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    UpdateDebtZustand: async (id: string, payload: {
        direction?: 'i_owe_them' | 'they_owe_me'
        amount?: number
        currency?: string
        description?: string
        due_date?: string
    }) => {
        try {
            const { data } = await axiosRequest.patch(`/debts/${id}`, payload)
            useDashboard.getState().fetchDashboard()
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    DeleteDebtZustand: async (id) => {
        try {
            await axiosRequest.delete(`/debts/${id}`)
            useDashboard.getState().fetchDashboard()
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    GetPaymentsZustand: async (id) => {
        try {
            const { data } = await axiosRequest.get(`/debts/${id}/payments`)
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    AddPaymentZustand: async (id, datas) => {
        try {
            const { data } = await axiosRequest.post(`/debts/${id}/payments`, datas)
            useDashboard.getState().fetchDashboard()
            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}))