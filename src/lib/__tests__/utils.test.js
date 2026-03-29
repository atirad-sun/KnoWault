import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateId, timeAgo, extractDomain, sanitizeUrl } from "../utils";

describe("generateId", () => {
  it("returns a valid UUID string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("returns unique IDs on consecutive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("sanitizeUrl", () => {
  it("allows http URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
  });

  it("allows https URLs", () => {
    expect(sanitizeUrl("https://example.com/path?q=1")).toBe(
      "https://example.com/path?q=1"
    );
  });

  it("blocks javascript: protocol", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
  });

  it("blocks data: protocol", () => {
    expect(sanitizeUrl("data:text/html,<h1>XSS</h1>")).toBe("");
  });

  it("blocks vbscript: protocol", () => {
    expect(sanitizeUrl("vbscript:msgbox")).toBe("");
  });

  it("returns empty string for invalid URLs", () => {
    expect(sanitizeUrl("not-a-url")).toBe("");
    expect(sanitizeUrl("")).toBe("");
  });

  it("returns empty string for null/undefined", () => {
    expect(sanitizeUrl(null)).toBe("");
    expect(sanitizeUrl(undefined)).toBe("");
  });

  it("blocks ftp: protocol", () => {
    expect(sanitizeUrl("ftp://files.example.com")).toBe("");
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for timestamps less than 1 minute ago', () => {
    expect(timeAgo(Date.now() - 30000)).toBe("just now");
    expect(timeAgo(Date.now())).toBe("just now");
  });

  it("returns minutes ago for timestamps 1-59 minutes ago", () => {
    expect(timeAgo(Date.now() - 60000)).toBe("1m ago");
    expect(timeAgo(Date.now() - 5 * 60000)).toBe("5m ago");
    expect(timeAgo(Date.now() - 59 * 60000)).toBe("59m ago");
  });

  it("returns hours ago for timestamps 1-23 hours ago", () => {
    expect(timeAgo(Date.now() - 60 * 60000)).toBe("1h ago");
    expect(timeAgo(Date.now() - 12 * 60 * 60000)).toBe("12h ago");
    expect(timeAgo(Date.now() - 23 * 60 * 60000)).toBe("23h ago");
  });

  it("returns days ago for timestamps 1-29 days ago", () => {
    expect(timeAgo(Date.now() - 24 * 60 * 60000)).toBe("1d ago");
    expect(timeAgo(Date.now() - 7 * 24 * 60 * 60000)).toBe("7d ago");
    expect(timeAgo(Date.now() - 29 * 24 * 60 * 60000)).toBe("29d ago");
  });

  it("returns months ago for timestamps 30+ days ago", () => {
    expect(timeAgo(Date.now() - 30 * 24 * 60 * 60000)).toBe("1mo ago");
    expect(timeAgo(Date.now() - 90 * 24 * 60 * 60000)).toBe("3mo ago");
  });
});

describe("extractDomain", () => {
  it("extracts domain from a valid URL", () => {
    expect(extractDomain("https://example.com/path")).toBe("example.com");
  });

  it("strips www. prefix", () => {
    expect(extractDomain("https://www.example.com")).toBe("example.com");
  });

  it("handles subdomains", () => {
    expect(extractDomain("https://blog.example.com/post")).toBe(
      "blog.example.com"
    );
  });

  it("handles URLs with ports", () => {
    expect(extractDomain("http://localhost:3000")).toBe("localhost");
  });

  it('returns empty string for invalid URLs', () => {
    expect(extractDomain("not-a-url")).toBe("");
    expect(extractDomain("")).toBe("");
  });

  it("handles YouTube URLs", () => {
    expect(extractDomain("https://www.youtube.com/watch?v=abc")).toBe(
      "youtube.com"
    );
  });
});
