import {
  dagre,
} from "../../lib/packages/dagre-imports.js";

import type {
  JSGraphEdge
} from "../../lib/packages/runSearchesInGuestEngine.js";

export function createLayoutGraph(graph: dagre.graphlib.Graph): dagre.graphlib.Graph {
  graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));
  graph.setGraph({
    "rankdir": "LR",
    "nodesep": 100,
    "ranksep": 100,
  });

  graph.nodes().forEach(v => {
    const node = graph.node(v);
    node.width = 100;
    node.height = 100;
    node.shape = "circle";

    if (v === "target:0")
      node.class = "target-node";
    else if (v === "heldValues:1")
      node.class = "heldValues-node";
    else if (/Tuple:\d+$/.test(v)) {
      node.shape = "rect";
    } else {
      node.class = "builtin-" + (node as unknown as { metadata: { builtInJSTypeName: string } }).metadata.builtInJSTypeName
    }
  });

  graph.edges().forEach(e => {
    const edge = graph.edge(e) as dagre.GraphEdge & JSGraphEdge;
    if (edge.isStrongReference === false) {
      edge.class = "isWeakReference";
      edge.arrowHeadClass = "arrowhead-gray";
      graph.setEdge(e, edge);
    }
  });
  dagre.layout(graph);
  return graph;
}
