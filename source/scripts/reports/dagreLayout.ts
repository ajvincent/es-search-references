import {
  dagre,
} from "../../lib/packages/dagre-imports.js";

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
  });

  graph.edges().forEach(e => {
    const edge = graph.edge(e);
    edge.arrowHeadClass = "arrowhead";
  });

  graph.edges().forEach((e: dagre.Edge) => {
    Reflect.set(e, "label", e.name!);
  });

  dagre.layout(graph);
  return graph;
}
