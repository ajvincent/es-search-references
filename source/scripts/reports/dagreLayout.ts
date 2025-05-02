import {
  dagre,
} from "../../lib/packages/dagre-imports.js";

export function createLayoutGraph(graph: dagre.graphlib.Graph): dagre.graphlib.Graph {
  graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));
  graph.setGraph({"rankdir": "LR"});
  graph.nodes().forEach(v => {
    const node = graph.node(v);
    node.width = 200;
    node.height = 200;
    node.shape = "circle";
  })

  graph.edges().forEach((e: dagre.Edge) => {
    Reflect.set(e, "label", e.name!);
  });
  dagre.layout(graph);
  return graph;
}
