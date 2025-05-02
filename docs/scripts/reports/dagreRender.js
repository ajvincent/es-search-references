import { d3, dagre, render as RenderCtor, } from "../../lib/packages/dagre-imports.js";
export function createRenderGraph(graph, svgView) {
    graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));
    graph.setGraph({ "rankdir": "LR" });
    graph.nodes().forEach(v => {
        const node = graph.node(v);
        node.width = 20;
        node.height = 20;
        node.shape = "circle";
    });
    const renderer = new RenderCtor();
    const svg = d3.select(svgView.svgSelector);
    const group = svg.select("g");
    renderer(group, graph);
    svg.attr("width", graph.graph().width);
    svg.attr("height", graph.graph().height);
}
