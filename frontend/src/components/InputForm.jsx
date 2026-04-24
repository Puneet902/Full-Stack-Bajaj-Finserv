import { useState, useRef } from 'react';
import { submitBfhlData } from '../services/api';

const EDGE_PATTERN = /^[A-Z]->[A-Z]$/;

const TEST_DATASETS = [
  {
    label: 'Simple Tree',
    data: ['A->B', 'A->C', 'B->D', 'B->E', 'C->F'],
  },
  {
    label: 'Deep Chain',
    data: ['A->B', 'B->C', 'C->D', 'D->E', 'E->F'],
  },
  {
    label: 'Cycle Example',
    data: ['A->B', 'B->C', 'C->A'],
  },
  {
    label: 'Multi-Root',
    data: ['A->B', 'A->C', 'X->Y', 'X->Z'],
  },
  {
    label: 'With Invalids',
    data: ['A->B', 'A->A', 'AB->C', 'a->b', 'A->B', '1->2', 'B->C'],
  },
];

const validateLine = (line) => {
  const trimmed = line.trim().replace(/^["']|["']$/g, '').trim();
  if (!trimmed) return 'empty';
  if (!EDGE_PATTERN.test(trimmed)) return 'invalid';
  const [p, c] = trimmed.split('->');
  if (p === c) return 'self-loop';
  return 'valid';
};

const InputForm = ({ onResult, setLoading, loading }) => {
  const [rawInput, setRawInput] = useState('{\n  "data": ["A->B", "A->C", "B->D"]\n}');
  const [error, setError] = useState(null);
  const [lineStatuses, setLineStatuses] = useState([]);
  const fileRef = useRef(null);

  const analyzeInputLines = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed?.data)) {
        setLineStatuses(parsed.data.map(validateLine));
        return;
      }
    } catch {}
    setLineStatuses([]);
  };

  const handleChange = (val) => {
    setRawInput(val);
    setError(null);
    analyzeInputLines(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsed = JSON.parse(rawInput);
      if (!parsed.data || !Array.isArray(parsed.data)) {
        throw new Error('JSON must contain a "data" array.');
      }
      const result = await submitBfhlData(parsed.data);
      onResult(result);
    } catch (err) {
      setError(err instanceof SyntaxError ? 'Invalid JSON syntax.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRawInput('{\n  "data": []\n}');
    setError(null);
    setLineStatuses([]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result.trim();
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          const formatted = JSON.stringify(parsed, null, 2);
          handleChange(formatted);
        } else {
          // .txt — one edge per line
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          const formatted = JSON.stringify({ data: lines }, null, 2);
          handleChange(formatted);
        }
      } catch {
        setError('Failed to parse file. Ensure it is valid JSON or one edge per line.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadTestData = (dataset) => {
    const formatted = JSON.stringify({ data: dataset.data }, null, 2);
    handleChange(formatted);
  };

  const validCount = lineStatuses.filter(s => s === 'valid').length;
  const invalidCount = lineStatuses.filter(s => s !== 'valid' && s !== 'empty').length;

  return (
    <div className="card input-card">
      <div className="card-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Submit Graph Data
        </h2>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} title="Upload file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.txt"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button className="btn btn-ghost btn-sm" onClick={handleClear}>Clear</button>
        </div>
      </div>

      <p className="subtitle">Enter edges as <code>X-&gt;Y</code> (single uppercase letters A–Z). Self-loops and numbers are rejected.</p>

      <div className="test-data-row">
        <span className="test-label">Quick load:</span>
        {TEST_DATASETS.map((d) => (
          <button key={d.label} className="btn btn-chip" onClick={() => loadTestData(d)}>
            {d.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="textarea-wrapper">
          <textarea
            value={rawInput}
            onChange={(e) => handleChange(e.target.value)}
            rows={9}
            placeholder='{ "data": ["A->B", "A->C"] }'
            className={error ? 'error-input' : ''}
            spellCheck={false}
          />
          {lineStatuses.length > 0 && (
            <div className="input-stats">
              <span className="stat-valid">✓ {validCount} valid</span>
              {invalidCount > 0 && <span className="stat-invalid">✗ {invalidCount} invalid</span>}
            </div>
          )}
        </div>

        {lineStatuses.length > 0 && (
          <div className="validation-preview">
            {(() => {
              try {
                const parsed = JSON.parse(rawInput);
                return (parsed.data || []).map((entry, i) => {
                  const status = lineStatuses[i] || 'valid';
                  return (
                    <span key={i} className={`entry-tag ${status}`} title={status}>
                      {entry}
                    </span>
                  );
                });
              } catch { return null; }
            })()}
          </div>
        )}

        {error && (
          <div className="error-message">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Analyzing…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Analyze Graph
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
