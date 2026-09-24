import { create } from "zustand";
import { persist } from "zustand/middleware";

// Mock, client-side-only credentials. There is no real backend to authenticate against.
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (username, password) => {
        const ok = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
        if (ok) set({ isAuthenticated: true });
        return ok;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    { name: "admin-auth-storage" },
  ),
);
