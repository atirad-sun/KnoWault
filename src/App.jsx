import { useAuth } from './hooks/useAuth';
import KnowledgeVault from './components/KnowledgeVault';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FAFAF9", gap: 16 }}>
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="14" fill="#2563EB"/>
          <path d="M32 14L46 24V38L32 48L18 38V24L32 14Z" stroke="white" strokeWidth="2.5" fill="none"/>
          <path d="M32 21L41 27.5V36.5L32 43L23 36.5V27.5L32 21Z" fill="white" fillOpacity="0.2"/>
          <text x="32" y="37" textAnchor="middle" fontFamily="Georgia, serif" fontSize="16" fontWeight="700" fill="white">K</text>
        </svg>
        <p style={{ color: "#78716C", fontSize: 14, fontFamily: "'DM Sans', system-ui, sans-serif" }}>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} />;
  }

  return <KnowledgeVault user={user} onLogout={logout} />;
}
