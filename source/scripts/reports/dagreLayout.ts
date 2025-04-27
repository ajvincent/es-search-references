import {
  graphlib,
  layout,
} from "../dagre-imports.js";

export function createLayoutGraph(graph: graphlib.Graph): graphlib.Graph {
  graph = graphlib.json.read(graphlib.json.write(graph));
  return graph;
}
