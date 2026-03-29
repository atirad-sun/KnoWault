export const CATEGORIES = [
  { id: "youtube", label: "YouTube", icon: "\u25B6", color: "#DC2626" },
  { id: "social", label: "Social Media", icon: "\u25C6", color: "#8B5CF6" },
  { id: "tool", label: "Tool / App", icon: "\u2699", color: "#0891B2" },
  { id: "article", label: "Article", icon: "\u25E7", color: "#D97706" },
  { id: "course", label: "Course", icon: "\u25CE", color: "#16A34A" },
  { id: "other", label: "Other", icon: "\u25C7", color: "#78716C" },
];

export const STORAGE_KEY = "knowledge-vault-items";

export const MAX_LENGTHS = {
  title: 200,
  url: 2048,
  description: 1000,
  tags: 500,
  notes: 5000,
};
