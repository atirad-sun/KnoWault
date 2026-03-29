import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../useLocalStorage";

// Create a simple localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i) => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("returns initial value when nothing is stored", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default")
    );
    expect(result.current[0]).toBe("default");
  });

  it("returns stored value when key exists in localStorage", () => {
    localStorageMock.setItem("test-key", JSON.stringify("stored-value"));
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default")
    );
    expect(result.current[0]).toBe("stored-value");
  });

  it("updates value and persists to localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default")
    );

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify("new-value")
    );
  });

  it("handles objects as values", () => {
    const { result } = renderHook(() => useLocalStorage("obj-key", {}));

    act(() => {
      result.current[1]({ name: "test", items: [1, 2, 3] });
    });

    expect(result.current[0]).toEqual({ name: "test", items: [1, 2, 3] });
  });

  it("returns initial value when localStorage has invalid JSON", () => {
    localStorageMock.getItem.mockReturnValueOnce("not-json{{{");
    const { result } = renderHook(() =>
      useLocalStorage("bad-key", "fallback")
    );
    expect(result.current[0]).toBe("fallback");
  });

  it("handles localStorage.setItem errors gracefully", () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("QuotaExceeded");
    });

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default")
    );

    act(() => {
      result.current[1]("new-value");
    });

    // State still updates even if localStorage fails
    expect(result.current[0]).toBe("new-value");
  });
});
