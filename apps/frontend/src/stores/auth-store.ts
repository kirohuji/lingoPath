import { create } from "zustand";

type AuthState = {
  token: string | null;
  permissions: string[];
  setToken: (token: string | null) => void;
  setPermissions: (permissions: string[]) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  permissions: [],
  setToken: (token) => set({ token }),
  setPermissions: (permissions) => set({ permissions }),
}));
