import { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import Chatbot from './components/Chatbot';
import LoginModal from './components/LoginModal';
import { fetchHistory } from './services/api';
import { useAuth } from './context/AuthContext';
import './styles.css';

export default function App() {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Auto-close modal when login succeeds
  useEffect(() => { if (user) setShowLogin(false); }, [user]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const items = await fetchHistory();
    setHistory(items);
    setHistoryLoading(false);
  };

  const handleHistoryToggle = () => {
    if (!showHistory) loadHistory();
    setShowHistory(h => !h);
  };

  const handleHistoryLoad = (item) => {
    if (item?.input_data?.data) {
      setShowHistory(false);
    }
  };

  return (
    <div className="app-root">
      <header className="app-header flex justify-between items-center p-4">
        <div className="header-left flex items-center gap-3">
          <div className="logo-mark">BH</div>
          <div>
            <h1 className="app-title text-xl font-bold">Graph Hierarchy Analyzer</h1>
            <p className="app-subtitle text-sm opacity-70">SRM Full Stack Engineering Challenge</p>
          </div>
        </div>
        <div className="header-right flex items-center gap-4">
          
          {user ? (
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src={user.photo || user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-gray-600" />
                <span className="hidden sm:inline font-medium text-sm">{user.name || user.displayName}</span>
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-slate-700">
                <div className="px-4 py-2 text-xs text-gray-400 border-b border-slate-700 truncate">{user.email}</div>
                {user.roll_number && <div className="px-4 py-1 text-xs text-gray-400 border-b border-slate-700 truncate">Roll: {user.roll_number}</div>}
                <button 
                  onClick={logout} 
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-sign-in" onClick={() => setShowLogin(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Sign In
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleHistoryToggle}
            title="Request history"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="hidden sm:inline ml-1 text-sm">History</span>
          </button>
          <button
            className="btn btn-ghost btn-sm theme-toggle"
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {showHistory && (
        <div className="history-panel">
          <div className="history-header">
            <h3>Request History</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowHistory(false)}>✕</button>
          </div>
          {historyLoading ? (
            <div className="history-loading">Loading…</div>
          ) : history.length === 0 ? (
            <div className="history-empty">No history found. Submit a request first.</div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => handleHistoryLoad(item)}
                  title="Click to load"
                >
                  <div className="history-edges">
                    {(item.input_data?.data || []).slice(0, 5).join(', ')}
                    {(item.input_data?.data?.length || 0) > 5 && ' …'}
                  </div>
                  <div className="history-time">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <main className="main-content">
        <InputForm onResult={setResultData} loading={loading} setLoading={setLoading} />
        <ResultDisplay data={resultData} />
      </main>

      <Chatbot context={resultData} />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
