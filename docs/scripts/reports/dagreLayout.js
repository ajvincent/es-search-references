import { graphlib, } from "../dagre-imports.js";
export function createLayoutGraph(graph) {
    graph = graphlib.json.read(graphlib.json.write(graph));
    return graph;
}
