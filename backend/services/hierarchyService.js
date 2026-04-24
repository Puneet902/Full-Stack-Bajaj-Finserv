import { validateData } from '../utils/validation.js';
import {
  buildTree,
  calculateDepth,
  detectCycleFromNode,
  getReachableNodes,
} from '../utils/graph.js';

export const processHierarchies = (data) => {
  const startTime = Date.now();

  const { validEntries, invalidEntries } = validateData(data);

  const duplicate_edges = [];
  const seenEdges = new Set();
  const childToParent = {};
  const adjacencyList = {};
  const allNodes = new Set();

  for (const entry of validEntries) {
    const [parent, child] = entry.split('->');
    allNodes.add(parent);
    allNodes.add(child);

    if (seenEdges.has(entry)) {
      if (!duplicate_edges.includes(entry)) duplicate_edges.push(entry);
      continue;
    }
    seenEdges.add(entry);

    // Multi-parent: silently keep first
    if (childToParent[child] !== undefined && childToParent[child] !== parent) {
      continue;
    }

    childToParent[child] = parent;

    if (!adjacencyList[parent]) adjacencyList[parent] = [];
    adjacencyList[parent].push(child);
  }

  // Collect final edges that were actually used
  const final_edges = [];
  for (const [child, parent] of Object.entries(childToParent)) {
    final_edges.push(`${parent}->${child}`);
  }

  // Find natural roots (nodes with no parent)
  const naturalRoots = [...allNodes]
    .filter((n) => childToParent[n] === undefined)
    .sort();

  // Discover all components via BFS from each root
  const visited = new Set();
  const components = [];

  for (const root of naturalRoots) {
    if (!visited.has(root)) {
      const reachable = getReachableNodes(adjacencyList, root);
      reachable.forEach((n) => visited.add(n));
      components.push({ root, nodes: reachable });
    }
  }

  // Remaining unvisited nodes are in pure cycles — pick lex smallest as root
  const unvisited = [...allNodes].filter((n) => !visited.has(n)).sort();
  for (const node of unvisited) {
    if (!visited.has(node)) {
      const reachable = getReachableNodes(adjacencyList, node);
      reachable.forEach((n) => visited.add(n));
      components.push({ root: node, nodes: reachable });
    }
  }

  // Build hierarchy for each component
  const hierarchies = [];
  let total_cycles = 0;
  let largestTreeRoot = null;
  let largestNodeCount = -1;

  for (const { root, nodes } of components) {
    const hasCycle = detectCycleFromNode(adjacencyList, root);

    if (hasCycle) {
      total_cycles++;
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
        depth: 0,
        node_count: nodes.size,
      });
      if (nodes.size > largestNodeCount) {
        largestNodeCount = nodes.size;
        largestTreeRoot = root;
      }
    } else {
      const tree = buildTree(adjacencyList, root);
      const depth = calculateDepth(adjacencyList, root);

      hierarchies.push({
        root,
        tree,
        has_cycle: false,
        depth,
        node_count: nodes.size,
      });

      if (nodes.size > largestNodeCount) {
        largestNodeCount = nodes.size;
        largestTreeRoot = root;
      }
    }
  }

  const processingTime = Date.now() - startTime;

  return {
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges,
    final_edges,
    summary: {
      total_trees: hierarchies.length,
      total_cycles,
      largest_tree_root: largestTreeRoot,
      total_valid_nodes: allNodes.size,
      total_edges: final_edges.length,
    },
    processing_time_ms: processingTime,
  };
};
