import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FEATURES = [
  { icon: '🌳', text: 'Visualize directed graph hierarchies' },
  { icon: '🔄', text: 'Detect cycles with DFS analysis' },
  { icon: '✅', text: 'Validate & clean edge data' },
  { icon: '🤖', text: 'AI assistant powered by LLaMA' },
];

export default function LoginModal({ onClose }) {
  const { loginWithGoogle } = useAuth();
  const [rollNumber, setRollNumber] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) {
      setError('College roll number is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(username.trim(), rollNumber.trim());
      onClose?.();
    } catch (err) {
      const msg = err?.code === 'auth/popup-closed-by-user'
        ? 'Popup was closed. Please try again.'
        : err?.code === 'auth/popup-blocked'
        ? 'Popup was blocked. Allow popups for this site.'
        : 'Sign-in failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Close button */}
        {onClose && (
          <button className="modal-close" onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Branding */}
        <div className="modal-brand">
          <div className="modal-logo">
            <span>BH</span>
          </div>
          <h1 className="modal-title">Graph Hierarchy Analyzer</h1>
          <p className="modal-sub">SRM Full Stack Engineering Challenge</p>
        </div>

        {/* Features */}
        <div className="modal-features">
          {FEATURES.map((f, i) => (
            <div key={i} className="modal-feature">
              <span className="modal-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="modal-divider"><span>Sign in to continue</span></div>

        {/* Form */}
        <form onSubmit={handleLogin} className="modal-form">
          <div className="modal-field">
            <label className="modal-label">
              College Roll Number <span className="required-star">*</span>
            </label>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. RA2211003010680"
              value={rollNumber}
              onChange={e => { setRollNumber(e.target.value); setError(''); }}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">
              Display Name <span className="modal-optional">(optional)</span>
            </label>
            <input
              type="text"
              className="modal-input"
              placeholder="Override your Google name"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="modal-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="modal-google-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="modal-spinner" />
                Signing in…
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>
        </form>

        <p className="modal-footer-note">
          Your data is secured via Firebase Auth. Roll number is stored for challenge identity.
        </p>
      </div>
    </div>
  );
}
