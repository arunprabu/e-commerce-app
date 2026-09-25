import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/store/authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
  });

  it("starts unauthenticated", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("authenticates with the correct credentials", () => {
    const ok = useAuthStore.getState().login("admin", "admin123");
    expect(ok).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("rejects a wrong password", () => {
    const ok = useAuthStore.getState().login("admin", "wrong");
    expect(ok).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("rejects an unknown username", () => {
    const ok = useAuthStore.getState().login("someone", "admin123");
    expect(ok).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("logs out", () => {
    useAuthStore.getState().login("admin", "admin123");
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
