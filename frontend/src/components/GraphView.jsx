import { useMemo } from 'react';

const NODE_R = 22;
const H_GAP = 80;
const V_GAP = 90;

function layoutTree(adjacencyList, root) {
  const positions = {};
  let leafIndex = 0;

  const assignPositions = (node, depth, visited = new Set()) => {
    if (visited.has(node)) return null;
    visited.add(node);

    const children = (adjacencyList[node] || []).filter(c => !visited.has(c));

    if (children.length === 0) {
      positions[node] = { x: leafIndex * H_GAP + NODE_R + 10, y: depth * V_GAP + NODE_R + 10 };
      leafIndex++;
      return positions[node].x;
    }

    const childXs = children.map(child => assignPositions(child, depth + 1, visited));
    const validXs = childXs.filter(x => x !== null);
    const x = validXs.length > 0
      ? (Math.min(...validXs) + Math.max(...validXs)) / 2
      : (leafIndex++ * H_GAP + NODE_R + 10);

    positions[node] = { x, y: depth * V_GAP + NODE_R + 10 };
    return x;
  };

  assignPositions(root, 0);
  return positions;
}

const GraphView = ({ hierarchies, finalEdges }) => {
  const { positions, edges, cycleNodes, svgWidth, svgHeight } = useMemo(() => {
    const adj = {};
    (finalEdges || []).forEach(edge => {
      const [p, c] = edge.split('->');
      if (!adj[p]) adj[p] = [];
      adj[p].push(c);
    });

    const cycleNodes = new Set(
      (hierarchies || [])
        .filter(h => h.has_cycle)
        .flatMap(h => [h.root, ...(finalEdges || [])
          .filter(e => e.startsWith(h.root + '->') || e.includes('->' + h.root))
          .flatMap(e => e.split('->'))])
    );

    const allPositions = {};
    (hierarchies || []).forEach(h => {
      const pos = layoutTree(adj, h.root);
      Object.assign(allPositions, pos);
    });

    const allX = Object.values(allPositions).map(p => p.x);
    const allY = Object.values(allPositions).map(p => p.y);
    const svgW = allX.length > 0 ? Math.max(...allX) + NODE_R + 20 : 200;
    const svgH = allY.length > 0 ? Math.max(...allY) + NODE_R + 20 : 200;

    const edgeList = (finalEdges || []).map(edge => {
      const [p, c] = edge.split('->');
      return { from: p, to: c, fromPos: allPositions[p], toPos: allPositions[c] };
    }).filter(e => e.fromPos && e.toPos);

    return {
      positions: allPositions,
      edges: edgeList,
      cycleNodes,
      svgWidth: Math.max(svgW, 200),
      svgHeight: Math.max(svgH, 200),
    };
  }, [hierarchies, finalEdges]);

  if (!hierarchies || hierarchies.length === 0) return null;

  const nodeColors = ['#60a5fa', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#38bdf8'];

  return (
    <div className="graph-view-container">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="graph-svg"
      >
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          <marker id="arrow-cycle" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#ef4444" />
          </marker>
        </defs>

        {edges.map((edge, i) => {
          const isCycleEdge = cycleNodes.has(edge.from) && cycleNodes.has(edge.to);
          const dx = edge.toPos.x - edge.fromPos.x;
          const dy = edge.toPos.y - edge.fromPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / dist;
          const ny = dy / dist;
          const x1 = edge.fromPos.x + nx * NODE_R;
          const y1 = edge.fromPos.y + ny * NODE_R;
          const x2 = edge.toPos.x - nx * (NODE_R + 6);
          const y2 = edge.toPos.y - ny * (NODE_R + 6);

          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isCycleEdge ? '#ef4444' : '#475569'}
              strokeWidth={isCycleEdge ? 2 : 1.5}
              markerEnd={isCycleEdge ? 'url(#arrow-cycle)' : 'url(#arrow)'}
              strokeDasharray={isCycleEdge ? '5,3' : 'none'}
            />
          );
        })}

        {Object.entries(positions).map(([node, pos], i) => {
          const isCycle = cycleNodes.has(node);
          const color = isCycle ? '#ef4444' : nodeColors[i % nodeColors.length];

          return (
            <g key={node}>
              <circle
                cx={pos.x} cy={pos.y} r={NODE_R}
                fill={color + '22'}
                stroke={color}
                strokeWidth={isCycle ? 2.5 : 2}
              />
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize="13"
                fontWeight="700"
                fontFamily="Inter, sans-serif"
              >
                {node}
              </text>
            </g>
          );
        })}
      </svg>

      {cycleNodes.size > 0 && (
        <div className="cycle-legend">
          <span className="cycle-dot" /> Red dashed edges indicate cycle paths
        </div>
      )}
    </div>
  );
};

export default GraphView;
