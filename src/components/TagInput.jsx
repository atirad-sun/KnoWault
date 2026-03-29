import { useState, useRef, useEffect } from "react";

export default function TagInput({ tags, onChange, allTags, maxLength = 500 }) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const totalLength = tags.join(",").length;

  // Filter suggestions: match existing tags not already selected
  const query = input.trim().toLowerCase();
  const suggestions = query
    ? allTags
        .filter(t => !tags.includes(t) && t.includes(query))
        .sort((a, b) => {
          // Exact prefix match first, then contains
          const aStarts = a.startsWith(query) ? 0 : 1;
          const bStarts = b.startsWith(query) ? 0 : 1;
          return aStarts - bStarts || a.localeCompare(b);
        })
        .slice(0, 8)
    : [];

  useEffect(() => {
    setHighlightIdx(-1);
  }, [input]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTag = (tag) => {
    const clean = tag.trim().toLowerCase();
    if (!clean) return;
    if (tags.includes(clean)) { setInput(""); return; }
    const newTags = [...tags, clean];
    if (newTags.join(",").length > maxLength) return;
    onChange(newTags);
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (idx) => {
    onChange(tags.filter((_, i) => i !== idx));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && suggestions[highlightIdx]) {
        addTag(suggestions[highlightIdx]);
      } else if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "," || e.key === "Tab") {
      if (input.trim()) {
        e.preventDefault();
        addTag(input);
      }
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div
        style={styles.wrap}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span key={tag} style={styles.chip}>
            #{tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              style={styles.chipX}
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type a tag and press Enter" : ""}
          style={styles.input}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={styles.dropdown}>
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
              style={{
                ...styles.suggestion,
                background: i === highlightIdx ? "#F5F5F4" : "transparent",
              }}
            >
              <span style={styles.suggestionHash}>#</span>{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    border: "1.5px solid #E8E5E1",
    borderRadius: 8,
    background: "#FAFAF9",
    cursor: "text",
    minHeight: 42,
    transition: "border-color 0.2s",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 10px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    background: "#F5F5F4",
    color: "#57534E",
    whiteSpace: "nowrap",
    lineHeight: 1.4,
  },
  chipX: {
    background: "none",
    border: "none",
    fontSize: 14,
    color: "#A8A29E",
    cursor: "pointer",
    padding: "0 2px",
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
  },
  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 15,
    color: "#1C1917",
    flex: 1,
    minWidth: 80,
    padding: "4px 0",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    background: "#fff",
    border: "1.5px solid #E8E5E1",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    zIndex: 20,
    maxHeight: 200,
    overflowY: "auto",
    padding: 4,
  },
  suggestion: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 12px",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    color: "#1C1917",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    transition: "background 0.1s",
  },
  suggestionHash: {
    color: "#A8A29E",
    marginRight: 2,
    fontWeight: 500,
  },
};
