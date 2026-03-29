import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../../App";

const mockUseAuth = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../KnowledgeVault", () => ({
  default: ({ user }) => (
    <div data-testid="knowledge-vault">KnowledgeVault for {user.email}</div>
  ),
}));

vi.mock("../LoginScreen", () => ({
  default: ({ onSignIn }) => (
    <div data-testid="login-screen">
      <button onClick={onSignIn}>Sign In</button>
    </div>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading screen while auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(<App />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders LoginScreen when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(<App />);
    expect(screen.getByTestId("login-screen")).toBeInTheDocument();
  });

  it("renders KnowledgeVault when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "123", email: "test@test.com" },
      loading: false,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(<App />);
    expect(screen.getByTestId("knowledge-vault")).toBeInTheDocument();
    expect(
      screen.getByText("KnowledgeVault for test@test.com")
    ).toBeInTheDocument();
  });
});
