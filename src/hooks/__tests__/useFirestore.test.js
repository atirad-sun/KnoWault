import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFirestore } from "../useFirestore";

const mockOnSnapshot = vi.fn();
const mockSetDoc = vi.fn();
const mockDeleteDoc = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => "mock-collection-ref"),
  query: vi.fn((ref) => ref),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  doc: vi.fn(() => "mock-doc-ref"),
  setDoc: (...args) => mockSetDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  writeBatch: vi.fn(),
}));

vi.mock("../../lib/firebase", () => ({
  db: {},
}));

describe("useFirestore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSnapshot.mockImplementation((query, onSuccess) => {
      onSuccess({
        docs: [
          {
            id: "item-1",
            data: () => ({ title: "Test Item", category: "article", tags: [] }),
          },
        ],
      });
      return vi.fn(); // unsubscribe
    });
    mockSetDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
  });

  it("returns items from Firestore snapshot", () => {
    const { result } = renderHook(() => useFirestore("user-123"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({
      id: "item-1",
      title: "Test Item",
      category: "article",
      tags: [],
    });
    expect(result.current.loading).toBe(false);
  });

  it("starts with loading true before snapshot", () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());
    const { result } = renderHook(() => useFirestore("user-123"));
    expect(result.current.loading).toBe(true);
    expect(result.current.items).toEqual([]);
  });

  it("addItem calls setDoc", async () => {
    const { result } = renderHook(() => useFirestore("user-123"));
    const newItem = { id: "item-2", title: "New Item" };
    await act(async () => {
      await result.current.addItem(newItem);
    });
    expect(mockSetDoc).toHaveBeenCalledWith("mock-doc-ref", newItem);
  });

  it("updateItem calls setDoc with merge", async () => {
    const { result } = renderHook(() => useFirestore("user-123"));
    await act(async () => {
      await result.current.updateItem("item-1", { title: "Updated" });
    });
    expect(mockSetDoc).toHaveBeenCalledWith(
      "mock-doc-ref",
      { title: "Updated" },
      { merge: true }
    );
  });

  it("deleteItem calls deleteDoc", async () => {
    const { result } = renderHook(() => useFirestore("user-123"));
    await act(async () => {
      await result.current.deleteItem("item-1");
    });
    expect(mockDeleteDoc).toHaveBeenCalledWith("mock-doc-ref");
  });

  it("unsubscribes from snapshot on unmount", () => {
    const unsubscribe = vi.fn();
    mockOnSnapshot.mockImplementation((query, onSuccess) => {
      onSuccess({ docs: [] });
      return unsubscribe;
    });

    const { unmount } = renderHook(() => useFirestore("user-123"));
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("handles snapshot error gracefully", () => {
    mockOnSnapshot.mockImplementation((query, onSuccess, onError) => {
      onError(new Error("Firestore error"));
      return vi.fn();
    });

    const { result } = renderHook(() => useFirestore("user-123"));
    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual([]);
  });

  it("rate limits rapid consecutive writes", async () => {
    const { result } = renderHook(() => useFirestore("user-123"));

    // First call should succeed
    await act(async () => {
      await result.current.addItem({ id: "item-a", title: "First" });
    });
    expect(mockSetDoc).toHaveBeenCalledTimes(1);

    // Immediate second call should throw rate limit error
    await act(async () => {
      try {
        await result.current.addItem({ id: "item-b", title: "Second" });
      } catch (e) {
        expect(e.message).toMatch(/Rate limit/);
      }
    });
    // setDoc should NOT have been called a second time
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
  });
});
