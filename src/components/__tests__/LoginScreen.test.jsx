import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginScreen from "../LoginScreen";

describe("LoginScreen", () => {
  let mockOnSignIn;

  beforeEach(() => {
    mockOnSignIn = vi.fn().mockResolvedValue(undefined);
  });

  it("renders the KnoWault title", () => {
    render(<LoginScreen onSignIn={mockOnSignIn} />);
    expect(screen.getByText("KnoWault")).toBeInTheDocument();
  });

  it("renders subtitle text", () => {
    render(<LoginScreen onSignIn={mockOnSignIn} />);
    expect(
      screen.getByText("Your personal knowledge vault")
    ).toBeInTheDocument();
  });

  it("renders Google sign-in button", () => {
    render(<LoginScreen onSignIn={mockOnSignIn} />);
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("calls onSignIn when button is clicked", async () => {
    render(<LoginScreen onSignIn={mockOnSignIn} />);
    fireEvent.click(screen.getByText("Continue with Google"));
    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    });
  });

  it('shows "Signing in…" during sign-in', async () => {
    let resolveSignIn;
    mockOnSignIn.mockImplementation(
      () => new Promise((resolve) => (resolveSignIn = resolve))
    );

    render(<LoginScreen onSignIn={mockOnSignIn} />);
    fireEvent.click(screen.getByText("Continue with Google"));

    expect(screen.getByText("Signing in…")).toBeInTheDocument();
    resolveSignIn();
  });

  it("shows error message on sign-in failure", async () => {
    mockOnSignIn.mockRejectedValue(new Error("Network error"));

    render(<LoginScreen onSignIn={mockOnSignIn} />);
    fireEvent.click(screen.getByText("Continue with Google"));

    await waitFor(() => {
      expect(
        screen.getByText("Sign-in failed. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("ignores popup-closed-by-user error", async () => {
    const error = new Error("Popup closed");
    error.code = "auth/popup-closed-by-user";
    mockOnSignIn.mockRejectedValue(error);

    render(<LoginScreen onSignIn={mockOnSignIn} />);
    fireEvent.click(screen.getByText("Continue with Google"));

    await waitFor(() => {
      expect(
        screen.queryByText("Sign-in failed. Please try again.")
      ).not.toBeInTheDocument();
    });
  });

  it("renders footer text about syncing", () => {
    render(<LoginScreen onSignIn={mockOnSignIn} />);
    expect(
      screen.getByText("Your data syncs across all your devices")
    ).toBeInTheDocument();
  });
});
