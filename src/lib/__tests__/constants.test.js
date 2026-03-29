import { describe, it, expect } from "vitest";
import { CATEGORIES, STORAGE_KEY, MAX_LENGTHS } from "../constants";

describe("CATEGORIES", () => {
  it("contains exactly 6 categories", () => {
    expect(CATEGORIES).toHaveLength(6);
  });

  it("each category has required fields", () => {
    CATEGORIES.forEach((cat) => {
      expect(cat).toHaveProperty("id");
      expect(cat).toHaveProperty("label");
      expect(cat).toHaveProperty("icon");
      expect(cat).toHaveProperty("color");
      expect(typeof cat.id).toBe("string");
      expect(typeof cat.label).toBe("string");
      expect(typeof cat.icon).toBe("string");
      expect(typeof cat.color).toBe("string");
    });
  });

  it("has unique IDs", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains expected category IDs", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(ids).toContain("youtube");
    expect(ids).toContain("social");
    expect(ids).toContain("tool");
    expect(ids).toContain("article");
    expect(ids).toContain("course");
    expect(ids).toContain("other");
  });

  it("has valid hex color codes", () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe("STORAGE_KEY", () => {
  it("is a non-empty string", () => {
    expect(typeof STORAGE_KEY).toBe("string");
    expect(STORAGE_KEY.length).toBeGreaterThan(0);
  });

  it("has expected value", () => {
    expect(STORAGE_KEY).toBe("knowledge-vault-items");
  });
});

describe("MAX_LENGTHS", () => {
  it("defines limits for all form fields", () => {
    expect(MAX_LENGTHS).toHaveProperty("title");
    expect(MAX_LENGTHS).toHaveProperty("url");
    expect(MAX_LENGTHS).toHaveProperty("description");
    expect(MAX_LENGTHS).toHaveProperty("tags");
    expect(MAX_LENGTHS).toHaveProperty("notes");
  });

  it("all limits are positive numbers", () => {
    Object.values(MAX_LENGTHS).forEach((limit) => {
      expect(typeof limit).toBe("number");
      expect(limit).toBeGreaterThan(0);
    });
  });

  it("has expected values", () => {
    expect(MAX_LENGTHS.title).toBe(200);
    expect(MAX_LENGTHS.url).toBe(2048);
    expect(MAX_LENGTHS.description).toBe(1000);
    expect(MAX_LENGTHS.tags).toBe(500);
    expect(MAX_LENGTHS.notes).toBe(5000);
  });
});
