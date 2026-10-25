import { describe, it, expect, vi, beforeEach } from "vitest";
import { isExpiredSessionError, recoverFromExpiredSession } from "@/lib/expiredSession";

beforeEach(() => window.sessionStorage.clear());

describe("isExpiredSessionError", () => {
  it("recognises the PostgREST code and the message", () => {
    expect(isExpiredSessionError({ code: "PGRST303", message: "JWT expired" })).toBe(true);
    expect(isExpiredSessionError({ code: null, message: "JWT expired" })).toBe(true);
    expect(isExpiredSessionError({ message: "jwt expired" })).toBe(true);
  });

  it("leaves every other failure alone, so a real error is not papered over", () => {
    expect(isExpiredSessionError({ code: "PGRST204", message: "column missing" })).toBe(false);
    expect(isExpiredSessionError({ code: "42501", message: "permission denied" })).toBe(false);
    expect(isExpiredSessionError({ message: "Invalid API key" })).toBe(false);
    expect(isExpiredSessionError(null)).toBe(false);
    expect(isExpiredSessionError(undefined)).toBe(false);
  });
});

describe("recoverFromExpiredSession", () => {
  it("signs out and reloads once", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const reload = vi.fn();
    await expect(recoverFromExpiredSession(signOut, reload)).resolves.toBe(true);
    expect(signOut).toHaveBeenCalledOnce();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("never reloads twice, so a different cause cannot spin forever", async () => {
    const reload = vi.fn();
    await recoverFromExpiredSession(vi.fn().mockResolvedValue(undefined), reload);
    await recoverFromExpiredSession(vi.fn().mockResolvedValue(undefined), reload);
    expect(reload).toHaveBeenCalledOnce();
  });

  it("still reloads when signing out throws", async () => {
    const reload = vi.fn();
    await recoverFromExpiredSession(vi.fn().mockRejectedValue(new Error("offline")), reload);
    expect(reload).toHaveBeenCalledOnce();
  });
});
