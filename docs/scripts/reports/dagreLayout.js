import { graphlib, layout, } from "../dagre-imports.js";
export function createLayoutGraph(graph) {
    graph = graphlib.json.read(graphlib.json.write(graph));
    graph.setGraph({ "rankdir": "LR" });
    graph.nodes().forEach(v => {
        graph.node(v).width = 200;
        graph.node(v).height = 200;
    });
    layout(graph);
    return graph;
}
