import { useState } from 'react';
import TreeNode from './TreeNode';
import GraphView from './GraphView';

const ResultDisplay = ({ data }) => {
  const [view, setView] = useState('tree');
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const { hierarchies, invalid_entries, duplicate_edges, final_edges, summary, processing_time_ms } = data;

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bfhl-result-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalNodes = summary?.total_valid_nodes ?? 0;
  const totalEdges = summary?.total_edges ?? 0;
  const totalTrees = summary?.total_trees ?? 0;
  const totalCycles = summary?.total_cycles ?? 0;
  const largestRoot = summary?.largest_tree_root ?? '—';

  return (
    <div className="results-container">

      {/* Identity Card */}
      <div className="card identity-card">
        <div className="card-header">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Identity
          </h3>
          <div className="export-row">
            <button className="btn btn-ghost btn-sm" onClick={copyJSON}>
              {copied ? '✓ Copied' : 'Copy JSON'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={downloadJSON}>↓ Download</button>
          </div>
        </div>
        <div className="identity-grid">
          <div className="id-item"><span className="id-label">User ID</span><span className="id-value accent">{data.user_id}</span></div>
          <div className="id-item"><span className="id-label">Email</span><span className="id-value">{data.email_id}</span></div>
          <div className="id-item"><span className="id-label">Roll No.</span><span className="id-value">{data.college_roll_number}</span></div>
        </div>
      </div>

      {/* Performance + Summary */}
      <div className="card summary-card">
        <div className="card-header">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Analysis Summary
          </h3>
          {processing_time_ms !== undefined && (
            <div className="perf-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {processing_time_ms}ms · {totalNodes} nodes
            </div>
          )}
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-val">{totalNodes}</div>
            <div className="stat-label">Valid Nodes</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{totalEdges}</div>
            <div className="stat-label">Final Edges</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{totalTrees}</div>
            <div className="stat-label">Total Trees</div>
          </div>
          <div className={`stat-box ${totalCycles > 0 ? 'danger' : 'success'}`}>
            <div className="stat-val">{totalCycles}</div>
            <div className="stat-label">Cycles</div>
          </div>
          <div className="stat-box accent-box">
            <div className="stat-val">{largestRoot}</div>
            <div className="stat-label">Largest Root</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{invalid_entries?.length ?? 0}</div>
            <div className="stat-label">Invalid</div>
          </div>
        </div>
      </div>

      {/* Hierarchies */}
      {hierarchies?.length > 0 && (
        <div className="card hierarchies-card">
          <div className="card-header">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
              Hierarchies
            </h3>
            <div className="view-toggle">
              <button className={`toggle-btn ${view === 'tree' ? 'active' : ''}`} onClick={() => setView('tree')}>Tree</button>
              <button className={`toggle-btn ${view === 'graph' ? 'active' : ''}`} onClick={() => setView('graph')}>Graph</button>
              <button className={`toggle-btn ${view === 'json' ? 'active' : ''}`} onClick={() => setView('json')}>JSON</button>
            </div>
          </div>

          {view === 'tree' && (
            <div className="tree-list">
              {hierarchies.map((h, i) => (
                <div key={i} className={`hierarchy-block ${h.has_cycle ? 'cycle-block' : ''}`}>
                  <div className="hierarchy-meta">
                    <span className="root-badge">Root: <strong>{h.root}</strong></span>
                    {h.has_cycle ? (
                      <span className="badge badge-danger">⚠ Cycle Detected</span>
                    ) : (
                      <>
                        <span className="badge badge-success">✓ Valid Tree</span>
                        <span className="badge badge-info">Depth: {h.depth}</span>
                        <span className="badge badge-info">Nodes: {h.node_count}</span>
                      </>
                    )}
                  </div>
                  {h.has_cycle ? (
                    <div className="cycle-message">
                      This component contains a cycle. The graph cannot be represented as a tree.
                      Use the Graph view to see the edges.
                    </div>
                  ) : (
                    <div className="tree-view">
                      <TreeNode name={h.root} children={h.tree} depth={0} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {view === 'graph' && (
            <div className="graph-scroll">
              <GraphView hierarchies={hierarchies} finalEdges={final_edges} />
            </div>
          )}

          {view === 'json' && (
            <div className="json-display">
              <pre>{JSON.stringify(hierarchies, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Issues */}
      {((invalid_entries?.length > 0) || (duplicate_edges?.length > 0)) && (
        <div className="issues-row">
          {invalid_entries?.length > 0 && (
            <div className="card issue-card invalid-card">
              <h3>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Invalid Entries ({invalid_entries.length})
              </h3>
              <div className="tag-list">
                {invalid_entries.map((e, i) => (
                  <span key={i} className="tag tag-red">{e || <em>empty</em>}</span>
                ))}
              </div>
            </div>
          )}
          {duplicate_edges?.length > 0 && (
            <div className="card issue-card duplicate-card">
              <h3>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l4 4v3.3" />
                  <path d="M18 14v4h4" /><path d="M18 22v.01" />
                  <path d="M13 14H9" /><path d="M9 18h4" />
                </svg>
                Duplicate Edges ({duplicate_edges.length})
              </h3>
              <div className="tag-list">
                {duplicate_edges.map((e, i) => (
                  <span key={i} className="tag tag-yellow">{e}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
