import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../useAuth";

// Mock Firebase
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  signOut: (...args) => mockSignOut(...args),
}));

vi.mock("../../lib/firebase", () => ({
  auth: { currentUser: null },
  googleProvider: { providerId: "google.com" },
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate initial auth check — no user
      callback(null);
      return vi.fn(); // unsubscribe
    });
    mockSignInWithPopup.mockResolvedValue({ user: { uid: "123" } });
    mockSignOut.mockResolvedValue(undefined);
  });

  it("starts with loading true and user null", () => {
    mockOnAuthStateChanged.mockImplementation(() => vi.fn());
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("sets loading to false after auth state resolves", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("sets user when auth state changes to logged in", () => {
    const mockUser = { uid: "user-123", email: "test@test.com" };
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it("calls signInWithPopup when signInWithGoogle is invoked", async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signInWithGoogle();
    });
    expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
  });

  it("calls signOut when logout is invoked", async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.logout();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes from auth on unmount", () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockImplementation(() => unsubscribe);

    const { unmount } = renderHook(() => useAuth());
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
