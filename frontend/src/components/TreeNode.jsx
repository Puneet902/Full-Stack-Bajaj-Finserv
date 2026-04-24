import { useState } from 'react';

const TreeNode = ({ name, children, depth = 0, isLast = false }) => {
  const [expanded, setExpanded] = useState(true);
  const childEntries = Object.entries(children || {});
  const hasChildren = childEntries.length > 0;

  const colors = [
    '#60a5fa', '#a78bfa', '#34d399', '#fb923c',
    '#f472b6', '#38bdf8', '#facc15', '#4ade80',
  ];
  const color = colors[depth % colors.length];

  return (
    <div className={`tree-node ${depth > 0 ? 'tree-node-child' : ''}`}>
      <div className="tree-node-row">
        {depth > 0 && (
          <div className="tree-connector">
            <div className={`tree-line-v ${isLast ? 'last' : ''}`} />
            <div className="tree-line-h" />
          </div>
        )}
        <div className="tree-node-content">
          {hasChildren && (
            <button
              className="tree-toggle-btn"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '▾' : '▸'}
            </button>
          )}
          <div
            className="node-badge"
            style={{ background: color + '22', border: `2px solid ${color}`, color }}
          >
            {name}
          </div>
          {hasChildren && (
            <span className="child-count">{childEntries.length} child{childEntries.length !== 1 ? 'ren' : ''}</span>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="tree-children">
          {childEntries.map(([child, grandchildren], idx) => (
            <TreeNode
              key={child}
              name={child}
              children={grandchildren}
              depth={depth + 1}
              isLast={idx === childEntries.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
