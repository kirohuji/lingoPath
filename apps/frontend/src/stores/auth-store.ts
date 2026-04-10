import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  permissions: string[];
  user: { id?: string; email?: string; name?: string; avatarUrl?: string } | null;
  setToken: (token: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  setUser: (user: { id?: string; email?: string; name?: string; avatarUrl?: string } | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      permissions: [],
      user: null,
      setToken: (token) => set({ token }),
      setPermissions: (permissions) => set({ permissions }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-store",
    },
  ),
);
