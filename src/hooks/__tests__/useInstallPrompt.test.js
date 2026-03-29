import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInstallPrompt } from "../useInstallPrompt";

describe("useInstallPrompt", () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts as not installable", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isInstallable).toBe(false);
  });

  it("registers beforeinstallprompt and appinstalled listeners", () => {
    renderHook(() => useInstallPrompt());
    const eventNames = addEventListenerSpy.mock.calls.map((c) => c[0]);
    expect(eventNames).toContain("beforeinstallprompt");
    expect(eventNames).toContain("appinstalled");
  });

  it("removes listeners on unmount", () => {
    const { unmount } = renderHook(() => useInstallPrompt());
    unmount();
    const eventNames = removeEventListenerSpy.mock.calls.map((c) => c[0]);
    expect(eventNames).toContain("beforeinstallprompt");
    expect(eventNames).toContain("appinstalled");
  });

  it("becomes installable on beforeinstallprompt event", () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      const event = new Event("beforeinstallprompt");
      event.preventDefault = vi.fn();
      event.prompt = vi.fn();
      event.userChoice = Promise.resolve({ outcome: "accepted" });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it("becomes not installable on appinstalled event", () => {
    const { result } = renderHook(() => useInstallPrompt());

    // First make installable
    act(() => {
      const event = new Event("beforeinstallprompt");
      event.preventDefault = vi.fn();
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    // Then install
    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(result.current.isInstallable).toBe(false);
  });
});
