import { useAuth } from './hooks/useAuth';
import KnowledgeVault from './components/KnowledgeVault';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FAFAF9" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#2563EB", animation: "pulse 1.5s ease-in-out infinite" }} />
        <p style={{ color: "#78716C", fontSize: 14, marginTop: 16, fontFamily: "'DM Sans', system-ui, sans-serif" }}>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} />;
  }

  return <KnowledgeVault user={user} onLogout={logout} />;
}
