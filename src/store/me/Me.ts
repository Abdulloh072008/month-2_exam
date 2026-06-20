import { create } from "zustand";
import { axiosRequest } from "../../utils/Token";

/* ---------------- TYPES ---------------- */

type User = {
  name: string;
  email: string;
  created_at?: string;
};

type MeStore = {
  user: User | null;
  loading: boolean;
  error: string | null;

  getProfile: () => Promise<void>;
  editProfile: (data: Partial<User>) => Promise<void>;
};


export const useMe = create<MeStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  getProfile: async () => {
    set({ loading: true, error: null });

    try {
      const { data } = await axiosRequest.get("/users/me");

      set({
        user: data,
        loading: false,
      });
      return data
    } catch (error) {
      set({
        error: error?.response?.data?.error || "Failed to fetch profile",
        loading: false,
      });
    }
  },

  editProfile: async (data) => {
    set({ loading: true, error: null });

    try {
      const { data: updatedUser } = await axiosRequest.patch("/users/me",data);
      set({
        user: updatedUser,
        loading: false,
      });
      return updatedUser
    } catch (error) {
      set({
        error: error?.response?.data?.error || "Failed to update profile",
        loading: false,
      });
    }
  },
}));