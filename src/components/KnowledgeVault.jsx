import { useState, useRef } from "react";
import { CATEGORIES, STORAGE_KEY } from "../lib/constants";
import { generateId, timeAgo, extractDomain } from "../lib/utils";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export default function KnowledgeVault() {
  const [items, setItems] = useLocalStorage(STORAGE_KEY, []);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterTag, setFilterTag] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", url: "", description: "", category: "article", tags: "", notes: "" });
  const [toast, setToast] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const searchRef = useRef(null);
  const { isInstallable, promptInstall } = useInstallPrompt();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const resetForm = () => {
    setForm({ title: "", url: "", description: "", category: "article", tags: "", notes: "" });
    setEditingId(null);
    setShowAdd(false);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const tags = form.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    if (editingId) {
      const updated = items.map(it => it.id === editingId ? { ...it, ...form, tags, updatedAt: Date.now() } : it);
      setItems(updated);
      showToast("Resource updated");
    } else {
      const newItem = { id: generateId(), ...form, tags, createdAt: Date.now(), updatedAt: Date.now(), pinned: false };
      const updated = [newItem, ...items];
      setItems(updated);
      showToast("Resource saved");
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setForm({ title: item.title, url: item.url, description: item.description, category: item.category, tags: item.tags.join(", "), notes: item.notes || "" });
    setEditingId(item.id);
    setShowAdd(true);
  };

  const handleDelete = (id) => {
    const updated = items.filter(it => it.id !== id);
    setItems(updated);
    showToast("Resource removed");
    setExpandedId(null);
  };

  const handlePin = (id) => {
    const updated = items.map(it => it.id === id ? { ...it, pinned: !it.pinned } : it);
    setItems(updated);
  };

  const handleDuplicate = (item) => {
    const dup = { ...item, id: generateId(), title: item.title + " (copy)", createdAt: Date.now(), updatedAt: Date.now(), pinned: false };
    const updated = [dup, ...items];
    setItems(updated);
    showToast("Duplicated");
  };

  const allTags = [...new Set(items.flatMap(it => it.tags))].sort();

  const filtered = items
    .filter(it => {
      if (filterCat !== "all" && it.category !== filterCat) return false;
      if (filterTag && !it.tags.includes(filterTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        return it.title.toLowerCase().includes(q) || it.description.toLowerCase().includes(q) || it.tags.some(t => t.includes(q)) || it.url.toLowerCase().includes(q) || (it.notes || "").toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });

  const catCounts = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = items.filter(it => it.category === c.id).length;
    return acc;
  }, {});

  const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[5];

  return (
    <div className="app-root" style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div className="header-top" style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Knowledge Vault</h1>
            <p style={styles.subtitle}>{items.length} resource{items.length !== 1 ? "s" : ""} saved</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isInstallable && (
              <button className="install-btn" onClick={promptInstall} style={styles.installBtn}>
                <span style={{ marginRight: 6 }}>⬇</span> Install App
              </button>
            )}
            <button className="add-btn" onClick={() => { resetForm(); setShowAdd(true); }} style={styles.addBtn}>
              <span style={{ fontSize: 20, marginRight: 6, fontWeight: 300 }}>+</span> Add Resource
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by title, tag, URL, or notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && <button onClick={() => setSearch("")} style={styles.clearBtn}>✕</button>}
        </div>

        {/* Category filters */}
        <div style={styles.filterRow}>
          <button className="cat-btn" onClick={() => setFilterCat("all")} style={{ ...styles.catPill, ...(filterCat === "all" ? styles.catPillActive : {}) }}>
            All ({items.length})
          </button>
          {CATEGORIES.map(c => (
            <button key={c.id} className="cat-btn" onClick={() => setFilterCat(filterCat === c.id ? "all" : c.id)} style={{ ...styles.catPill, ...(filterCat === c.id ? { ...styles.catPillActive, background: c.color + "14", borderColor: c.color + "44", color: c.color } : {}) }}>
              <span style={{ marginRight: 4 }}>{c.icon}</span> {c.label} ({catCounts[c.id] || 0})
            </button>
          ))}
        </div>

        {/* Tags row */}
        {allTags.length > 0 && (
          <div style={styles.tagsRow}>
            <span style={{ fontSize: 12, color: "#78716C", fontWeight: 500, marginRight: 8, whiteSpace: "nowrap" }}>Tags:</span>
            <div style={styles.tagsScroll}>
              {allTags.map(t => (
                <button key={t} className="tag-btn" onClick={() => setFilterTag(filterTag === t ? "" : t)} style={{ ...styles.tagChip, ...(filterTag === t ? { background: "#2563EB", color: "#fff" } : {}) }}>
                  #{t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View toggle */}
        <div style={styles.viewToggle}>
          <button className="icon-btn" onClick={() => setView("grid")} style={{ ...styles.viewBtn, ...(view === "grid" ? styles.viewBtnActive : {}) }} title="Grid view">▦</button>
          <button className="icon-btn" onClick={() => setView("list")} style={{ ...styles.viewBtn, ...(view === "list" ? styles.viewBtnActive : {}) }} title="List view">≡</button>
        </div>
      </header>

      {/* Add/Edit Panel */}
      {showAdd && (
        <div style={styles.formOverlay} onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div style={styles.formPanel}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>{editingId ? "Edit Resource" : "Add New Resource"}</h2>
              <button onClick={resetForm} style={styles.formClose}>✕</button>
            </div>
            <div style={styles.formBody}>
              <label style={styles.label}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. How to use Figma Auto Layout" style={styles.input} />

              <label style={styles.label}>URL</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." style={styles.input} />

              <label style={styles.label}>Category</label>
              <div className="cat-grid" style={styles.catGrid}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setForm(f => ({ ...f, category: c.id }))} style={{ ...styles.catOption, ...(form.category === c.id ? { borderColor: c.color, background: c.color + "10", color: c.color } : {}) }}>
                    <span style={{ marginRight: 6 }}>{c.icon}</span>{c.label}
                  </button>
                ))}
              </div>

              <label style={styles.label}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this about? Why is it useful?" rows={3} style={styles.textarea} />

              <label style={styles.label}>Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="design, figma, tutorial" style={styles.input} />

              <label style={styles.label}>Personal Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Key takeaways, timestamps, reminders…" rows={3} style={styles.textarea} />
            </div>
            <div style={styles.formFooter}>
              <button onClick={resetForm} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSave} style={{ ...styles.saveBtn, opacity: form.title.trim() ? 1 : 0.4 }}>
                {editingId ? "Update" : "Save Resource"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main style={styles.main}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>◇</div>
            <h3 style={styles.emptyTitle}>{items.length === 0 ? "Your vault is empty" : "No results found"}</h3>
            <p style={styles.emptyText}>{items.length === 0 ? "Start saving resources you want to come back to." : "Try a different search or filter."}</p>
            {items.length === 0 && (
              <button className="add-btn" onClick={() => setShowAdd(true)} style={{ ...styles.addBtn, marginTop: 20 }}>
                <span style={{ fontSize: 20, marginRight: 6, fontWeight: 300 }}>+</span> Add your first resource
              </button>
            )}
          </div>
        ) : (
          <div style={view === "grid" ? styles.grid : styles.list}>
            {filtered.map((item, i) => {
              const cat = getCat(item.category);
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className="card" style={{ ...(view === "grid" ? styles.gridCard : styles.listCard), animation: `fadeUp 0.35s ease-out ${i * 0.04}s both` }}>
                  {/* Top bar */}
                  <div style={styles.cardTop}>
                    <span style={{ ...styles.catBadge, background: cat.color + "14", color: cat.color }}>
                      {cat.icon} {cat.label}
                    </span>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button className="icon-btn" onClick={() => handlePin(item.id)} style={{ ...styles.smallIconBtn, color: item.pinned ? "#D97706" : "#A8A29E" }} title={item.pinned ? "Unpin" : "Pin"}>
                        {item.pinned ? "★" : "☆"}
                      </button>
                      <button className="icon-btn" onClick={() => setExpandedId(isExpanded ? null : item.id)} style={styles.smallIconBtn} title="More">
                        ⋯
                      </button>
                    </div>
                  </div>

                  {/* Title & link */}
                  <h3 style={styles.cardTitle}>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="link-hover" style={styles.cardLink}>{item.title}</a>
                    ) : item.title}
                  </h3>
                  {item.url && <p style={styles.cardDomain}>{extractDomain(item.url)}</p>}

                  {/* Description */}
                  {item.description && <p style={styles.cardDesc}>{item.description}</p>}

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div style={styles.cardTags}>
                      {item.tags.map(t => (
                        <span key={t} className="tag-btn" onClick={() => { setFilterTag(t); setFilterCat("all"); }} style={styles.cardTag}>#{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Notes preview */}
                  {item.notes && (
                    <div style={styles.notesPreview}>
                      <span style={{ fontSize: 11, color: "#78716C", fontWeight: 500 }}>Notes:</span>
                      <p style={styles.notesText}>{item.notes.length > 120 ? item.notes.slice(0, 120) + "…" : item.notes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={styles.cardFooter}>
                    <span style={styles.cardTime}>{timeAgo(item.createdAt)}</span>
                  </div>

                  {/* Expanded actions */}
                  {isExpanded && (
                    <div style={styles.expandedActions}>
                      <button className="icon-btn" onClick={() => { handleEdit(item); setExpandedId(null); }} style={styles.actionBtn}>✎ Edit</button>
                      <button className="icon-btn" onClick={() => { handleDuplicate(item); setExpandedId(null); }} style={styles.actionBtn}>⧉ Duplicate</button>
                      <button className="del-btn" onClick={() => handleDelete(item.id)} style={{ ...styles.actionBtn, color: "#DC2626" }}>✕ Remove</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    background: "#FAFAF9",
    minHeight: "100vh",
    color: "#1C1917",
  },

  // Header
  header: {
    padding: "32px 24px 0",
    maxWidth: 1200, margin: "0 auto",
  },
  headerTop: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24,
  },
  title: {
    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#1C1917",
  },
  subtitle: {
    fontSize: 14, color: "#78716C", marginTop: 6, fontWeight: 400,
  },
  addBtn: {
    display: "inline-flex", alignItems: "center", padding: "10px 20px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
  },
  installBtn: {
    display: "inline-flex", alignItems: "center", padding: "10px 20px", background: "#1E40AF", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
  },

  // Search
  searchWrap: {
    position: "relative", marginBottom: 16,
  },
  searchIcon: {
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#A8A29E", pointerEvents: "none",
  },
  searchInput: {
    width: "100%", padding: "12px 40px 12px 40px", border: "1.5px solid #E8E5E1", borderRadius: 10, fontSize: 15, background: "#fff", color: "#1C1917", transition: "border-color 0.2s",
  },
  clearBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 14, color: "#A8A29E", cursor: "pointer", padding: 4,
  },

  // Filters
  filterRow: {
    display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12,
  },
  catPill: {
    padding: "6px 14px", borderRadius: 20, border: "1.5px solid #E8E5E1", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#57534E", transition: "all 0.15s ease", whiteSpace: "nowrap",
  },
  catPillActive: {
    background: "#1C1917", borderColor: "#1C1917", color: "#fff",
  },

  // Tags
  tagsRow: {
    display: "flex", alignItems: "center", marginBottom: 12, overflow: "hidden",
  },
  tagsScroll: {
    display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4,
  },
  tagChip: {
    padding: "3px 10px", borderRadius: 12, border: "none", background: "#F5F5F4", fontSize: 12, fontWeight: 500, cursor: "pointer", color: "#57534E", transition: "all 0.15s ease", whiteSpace: "nowrap",
  },

  // View toggle
  viewToggle: {
    display: "flex", gap: 4, marginBottom: 16, justifyContent: "flex-end",
  },
  viewBtn: {
    padding: "6px 10px", borderRadius: 6, border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#A8A29E", transition: "all 0.15s",
  },
  viewBtnActive: {
    background: "#F5F5F4", color: "#1C1917",
  },

  // Content
  main: {
    padding: "0 24px 48px", maxWidth: 1200, margin: "0 auto",
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16,
  },
  list: {
    display: "flex", flexDirection: "column", gap: 10,
  },
  gridCard: {
    background: "#fff", borderRadius: 12, border: "1.5px solid #E8E5E1", padding: 20, display: "flex", flexDirection: "column", gap: 8, transition: "all 0.25s ease", cursor: "default", position: "relative",
  },
  listCard: {
    background: "#fff", borderRadius: 10, border: "1.5px solid #E8E5E1", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6, transition: "all 0.25s ease", cursor: "default", position: "relative",
  },

  // Card parts
  cardTop: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  catBadge: {
    padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
  },
  smallIconBtn: {
    background: "none", border: "none", fontSize: 16, cursor: "pointer", padding: "2px 6px", borderRadius: 4, transition: "all 0.15s", minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em",
  },
  cardLink: {
    color: "#1C1917", textDecoration: "none", transition: "color 0.15s",
  },
  cardDomain: {
    fontSize: 12, color: "#A8A29E", fontWeight: 400,
  },
  cardDesc: {
    fontSize: 14, color: "#57534E", lineHeight: 1.55,
  },
  cardTags: {
    display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2,
  },
  cardTag: {
    padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500, background: "#F5F5F4", color: "#78716C", cursor: "pointer", border: "none", transition: "background 0.15s",
  },
  notesPreview: {
    background: "#FAFAF9", borderRadius: 8, padding: "8px 10px", marginTop: 2,
  },
  notesText: {
    fontSize: 13, color: "#57534E", lineHeight: 1.5, marginTop: 2, fontStyle: "italic",
  },
  cardFooter: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 4,
  },
  cardTime: {
    fontSize: 11, color: "#A8A29E", fontWeight: 500,
  },
  expandedActions: {
    display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid #F5F5F4", marginTop: 4, animation: "fadeUp 0.2s ease-out both",
  },
  actionBtn: {
    padding: "5px 12px", borderRadius: 6, border: "none", background: "#F5F5F4", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#57534E", transition: "all 0.15s",
  },

  // Empty state
  emptyState: {
    textAlign: "center", padding: "80px 24px",
  },
  emptyIcon: {
    fontSize: 48, color: "#D6D3D1", marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 600, color: "#1C1917", marginBottom: 8,
  },
  emptyText: {
    fontSize: 15, color: "#78716C",
  },

  // Form overlay
  formOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(28,25,23,0.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16, animation: "fadeUp 0.2s ease-out both",
  },
  formPanel: {
    background: "#fff", borderRadius: 16, maxWidth: 560, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
  },
  formHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 0",
  },
  formTitle: {
    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700,
  },
  formClose: {
    background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#A8A29E", padding: 4,
  },
  formBody: {
    padding: "16px 24px",
  },
  label: {
    display: "block", fontSize: 13, fontWeight: 600, color: "#57534E", marginBottom: 6, marginTop: 14,
  },
  input: {
    width: "100%", padding: "10px 14px", border: "1.5px solid #E8E5E1", borderRadius: 8, fontSize: 15, color: "#1C1917", background: "#FAFAF9", transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%", padding: "10px 14px", border: "1.5px solid #E8E5E1", borderRadius: 8, fontSize: 15, color: "#1C1917", background: "#FAFAF9", resize: "vertical", transition: "border-color 0.2s", lineHeight: 1.5,
  },
  catGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
  },
  catOption: {
    padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E8E5E1", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#57534E", transition: "all 0.15s", textAlign: "left",
  },
  formFooter: {
    display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px 20px", borderTop: "1px solid #F5F5F4",
  },
  cancelBtn: {
    padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E8E5E1", background: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#57534E",
  },
  saveBtn: {
    padding: "10px 24px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s",
  },

  // Toast
  toast: {
    position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1C1917", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 200, animation: "toastIn 0.3s ease-out both", boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
};
