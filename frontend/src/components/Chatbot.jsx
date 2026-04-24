import { useState, useRef, useEffect, Fragment } from 'react';
import { sendChatMessage } from '../services/api';

const SUGGESTIONS = [
  'Explain the tree hierarchy',
  'Why does a cycle occur?',
  'Generate sample test data',
  'How is depth calculated?',
  'What makes an entry invalid?',
];

const Chatbot = ({ context }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I can explain tree structures, detect cycle causes, suggest corrections, or generate test data. Ask me anything!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(msg, context);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Error: ${err.message}`, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        className={`chatbot-fab ${open ? 'active' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="AI Assistant"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {!open && <span className="fab-label">AI Chat</span>}
      </button>

      {open && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <div className="chatbot-avatar">AI</div>
              <div>
                <div className="chatbot-name">Tree Assistant</div>
                <div className="chatbot-status">
                  <span className="status-dot" />
                  Powered by LLaMA via Groq
                </div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role} ${m.isError ? 'error' : ''}`}>
                {m.role === 'assistant' && <div className="chat-avatar">AI</div>}
                <div className="chat-bubble">
                  {m.text.split('\n').map((line, j) => (
                    <Fragment key={j}>
                      {line}
                      {j < m.text.split('\n').length - 1 && <br />}
                    </Fragment>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg assistant">
                <div className="chat-avatar">AI</div>
                <div className="chat-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {context && (
            <div className="chat-context-badge">
              Context loaded from last API result
            </div>
          )}

          <div className="chatbot-input-row">
            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about trees, cycles, validation…"
              rows={2}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
