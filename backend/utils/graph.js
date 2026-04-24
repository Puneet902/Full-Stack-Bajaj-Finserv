const EDGE_PATTERN = /^[A-Z]->[A-Z]$/;

export const parseNode = (entry) => {
  if (typeof entry !== 'string') return null;
  const trimmed = entry.trim();
  if (!EDGE_PATTERN.test(trimmed)) return null;
  const [parent, child] = trimmed.split('->');
  if (parent === child) return null;
  return { parent, child };
};

export const detectCycleFromNode = (adjacencyList, startNode) => {
  const visited = new Set();
  const recursionStack = new Set();

  const dfs = (node) => {
    if (recursionStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recursionStack.add(node);

    for (const child of (adjacencyList[node] || [])) {
      if (dfs(child)) return true;
    }

    recursionStack.delete(node);
    return false;
  };

  return dfs(startNode);
};

export const buildTree = (adjacencyList, root) => {
  const visited = new Set();

  const build = (node) => {
    if (visited.has(node)) return {};
    visited.add(node);
    const children = adjacencyList[node] || [];
    if (children.length === 0) return {};
    const nodeTree = {};
    for (const child of children) {
      nodeTree[child] = build(child);
    }
    return nodeTree;
  };

  return build(root);
};

export const calculateDepth = (adjacencyList, root) => {
  const visited = new Set();

  const dfs = (node) => {
    if (visited.has(node)) return 1;
    visited.add(node);
    const children = adjacencyList[node] || [];
    if (children.length === 0) return 1;
    let maxChild = 0;
    for (const child of children) {
      maxChild = Math.max(maxChild, dfs(child));
    }
    return 1 + maxChild;
  };

  return dfs(root);
};

export const getReachableNodes = (adjacencyList, root) => {
  const visited = new Set();

  const dfs = (node) => {
    if (visited.has(node)) return;
    visited.add(node);
    for (const child of (adjacencyList[node] || [])) {
      dfs(child);
    }
  };

  dfs(root);
  return visited;
};

export const countTreeNodes = (tree) => {
  if (!tree || typeof tree !== 'object') return 1;
  const keys = Object.keys(tree);
  return 1 + keys.reduce((sum, key) => sum + countTreeNodes(tree[key]), 0);
};
