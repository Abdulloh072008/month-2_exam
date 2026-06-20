import { create } from "zustand";
import { axiosRequest } from "../../utils/Token";

type Debt = {
  id: string;
  contact_id: string;
  direction: "they_owe_me" | "i_owe_them";
  amount: number;
  created_at: string;
};

type Contact = {
  id: string;
  name: string;
};

type Payment = {
  id: string;
  amount: number;
  paid_at: string;
};

type Summary = {
  totals: { they_owe_me: number; i_owe_them: number };
  outstanding: { they_owe_me: number; i_owe_them: number; net_balance: number };
};

type RecentPayment = {
  id: string;
  amount: number;
  paid_at: string;
  contact_name: string;
  direction: "they_owe_me" | "i_owe_them";
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const useDashboard = create((set) => ({
  summary: null as Summary | null,
  monthlyData: [] as { month: string; lent: number; borrowed: number }[],
  recentPayments: [] as RecentPayment[],
  loading: false,

  fetchDashboard: async () => {
    set({ loading: true });
    try {
      const { data: summary } = await axiosRequest.get("/dashboard/summary");

      const { data: debts } = await axiosRequest.get<Debt[]>("/debts");

      const { data: contacts } = await axiosRequest.get<Contact[]>("/contacts");

      const contactMap: Record<string, string> = {};
      contacts.forEach((c) => { contactMap[c.id] = c.name; });

      const monthMap: Record<string, { lent: number; borrowed: number }> = {};
      MONTHS.forEach((m) => { monthMap[m] = { lent: 0, borrowed: 0 }; });

      debts.forEach((debt) => {
        const month = MONTHS[new Date(debt.created_at).getMonth()];
        if (debt.direction === "they_owe_me") monthMap[month].lent += debt.amount;
        else monthMap[month].borrowed += debt.amount;
      });

      const monthlyData = MONTHS.map((month) => ({ month, ...monthMap[month] }));

      const recentPayments: RecentPayment[] = [];
      for (const debt of debts) {

        const { data: payments } = await axiosRequest.get<Payment[]>(`/debts/${debt.id}/payments`);
        payments.forEach((payment) => {
          recentPayments.push({
            id: payment.id,
            amount: payment.amount,
            paid_at: payment.paid_at,
            contact_name: contactMap[debt.contact_id] || "Unknown",
            direction: debt.direction,
          });
        });
      }

      recentPayments.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());

      set({
        summary,
        monthlyData,
        recentPayments: recentPayments.slice(0, 5),
        loading: false,
      });
    } catch (error) {
      console.log(error);
      set({ loading: false });
    }
  },
}));