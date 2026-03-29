import { useState } from "react";

export default function LoginScreen({ onSignIn }) {
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await onSignIn();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Sign-in failed. Please try again.");
      }
      setSigningIn(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="14" fill="#2563EB"/>
            <path d="M32 12L48 24V40L32 52L16 40V24L32 12Z" stroke="white" strokeWidth="2.5" fill="none"/>
            <path d="M32 20L42 27V37L32 44L22 37V27L32 20Z" fill="white" fillOpacity="0.2"/>
            <text x="32" y="38" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fontWeight="700" fill="white">K</text>
          </svg>
        </div>
        <h1 style={styles.title}>KnoWault</h1>
        <p style={styles.subtitle}>Your personal knowledge vault</p>

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          style={{ ...styles.googleBtn, opacity: signingIn ? 0.6 : 1 }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 10, flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {signingIn ? "Signing in…" : "Continue with Google"}
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.footer}>
          Your data syncs across all your devices
        </p>
      </div>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    background: "#FAFAF9",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "48px 32px",
    maxWidth: 380,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
    border: "1.5px solid #E8E5E1",
  },
  iconWrap: {
    marginBottom: 20,
  },
  title: {
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#1C1917",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#78716C",
    marginBottom: 32,
  },
  googleBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "14px 24px",
    background: "#fff",
    border: "1.5px solid #E8E5E1",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    color: "#1C1917",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 12,
  },
  footer: {
    fontSize: 13,
    color: "#A8A29E",
    marginTop: 24,
  },
};
