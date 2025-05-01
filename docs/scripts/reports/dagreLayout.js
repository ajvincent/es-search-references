import { dagre, } from "../../lib/packages/dagre-imports.js";
export function createLayoutGraph(graph) {
    graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));
    graph.setGraph({ "rankdir": "LR" });
    graph.nodes().forEach(v => {
        graph.node(v).width = 200;
        graph.node(v).height = 200;
    });
    dagre.layout(graph);
    return graph;
}
