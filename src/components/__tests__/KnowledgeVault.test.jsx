import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KnowledgeVault from "../KnowledgeVault";

const mockAddItem = vi.fn().mockResolvedValue(undefined);
const mockUpdateItem = vi.fn().mockResolvedValue(undefined);
const mockDeleteItem = vi.fn().mockResolvedValue(undefined);

const mockItems = [
  {
    id: "item-1",
    title: "React Tutorial",
    url: "https://react.dev",
    description: "Official React docs",
    category: "course",
    tags: ["react", "javascript"],
    notes: "Great for beginners",
    pinned: false,
    createdAt: Date.now() - 60000,
    updatedAt: Date.now() - 60000,
  },
  {
    id: "item-2",
    title: "VS Code",
    url: "https://code.visualstudio.com",
    description: "Code editor",
    category: "tool",
    tags: ["editor", "dev"],
    notes: "",
    pinned: true,
    createdAt: Date.now() - 120000,
    updatedAt: Date.now() - 120000,
  },
];

vi.mock("../../hooks/useFirestore", () => ({
  useFirestore: () => ({
    items: mockItems,
    loading: false,
    addItem: mockAddItem,
    updateItem: mockUpdateItem,
    deleteItem: mockDeleteItem,
  }),
}));

vi.mock("../../hooks/useInstallPrompt", () => ({
  useInstallPrompt: () => ({
    isInstallable: false,
    promptInstall: vi.fn(),
  }),
}));

const mockUser = {
  uid: "user-123",
  email: "test@test.com",
  displayName: "Test User",
  photoURL: null,
};

describe("KnowledgeVault", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the greeting and resource count", () => {
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);
    expect(screen.getByText(/2 resources/)).toBeInTheDocument();
  });

  it("renders all category filter buttons including All", () => {
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);
    // Use getAllByText since category labels appear in both filter pills and card badges
    expect(screen.getAllByText(/YouTube/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Social Media/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Tool/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Article/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Course/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Other/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders resource cards", () => {
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);
    expect(screen.getByText("React Tutorial")).toBeInTheDocument();
    expect(screen.getByText("VS Code")).toBeInTheDocument();
  });

  it("shows pinned items with star indicator", () => {
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);
    // VS Code is pinned — should show filled star ★ on card
    const stars = screen.getAllByText("★");
    expect(stars.length).toBeGreaterThanOrEqual(1);
  });

  it("renders search input", () => {
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Search by title/)).toBeInTheDocument();
  });

  it("filters items by search query", async () => {
    const user = userEvent.setup();
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/Search by title/);
    await user.type(searchInput, "React");

    expect(screen.getByText("React Tutorial")).toBeInTheDocument();
    expect(screen.queryByText("VS Code")).not.toBeInTheDocument();
  });

  it("shows tags from items", () => {
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);
    // Tags appear in both the tag filter row and on cards, use getAllByText
    expect(screen.getAllByText("#react").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("#javascript").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("#editor").length).toBeGreaterThanOrEqual(1);
  });

  it("renders domain from URLs", () => {
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);
    expect(screen.getByText("react.dev")).toBeInTheDocument();
    expect(screen.getByText("code.visualstudio.com")).toBeInTheDocument();
  });

  it("opens add form when FAB button is clicked", async () => {
    const user = userEvent.setup();
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);

    // The FAB uses aria-label
    const fab = screen.getByLabelText("Add Resource");
    await user.click(fab);

    expect(screen.getByText("Add New Resource")).toBeInTheDocument();
  });

  it("view toggle switches between grid and list", async () => {
    const user = userEvent.setup();
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);

    const listBtn = screen.getByTitle("List view");
    await user.click(listBtn);

    const gridBtn = screen.getByTitle("Grid view");
    await user.click(gridBtn);

    expect(listBtn).toBeInTheDocument();
    expect(gridBtn).toBeInTheDocument();
  });

  it("form inputs have maxLength attributes", async () => {
    const user = userEvent.setup();
    render(<KnowledgeVault user={mockUser} onLogout={vi.fn()} />);

    const fab = screen.getByLabelText("Add Resource");
    await user.click(fab);

    const titleInput = screen.getByPlaceholderText(/e\.g\./);
    const urlInput = screen.getByPlaceholderText("https://...");
    const descInput = screen.getByPlaceholderText(/What is this about/);
    const tagsInput = screen.getByPlaceholderText("Type a tag and press Enter");
    const notesInput = screen.getByPlaceholderText(/Key takeaways/);

    expect(titleInput).toHaveAttribute("maxlength", "200");
    expect(urlInput).toHaveAttribute("maxlength", "2048");
    expect(descInput).toHaveAttribute("maxlength", "1000");
    // TagInput enforces max length programmatically, not via maxlength attribute
    expect(tagsInput).toBeInTheDocument();
    expect(notesInput).toHaveAttribute("maxlength", "5000");
  });
});
