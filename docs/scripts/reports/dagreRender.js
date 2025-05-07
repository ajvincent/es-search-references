import { d3, dagre, render as RenderCtor, } from "../../lib/packages/dagre-imports.js";
export function createRenderGraph(graph, svgView) {
    graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));
    const renderer = new RenderCtor();
    const svg = d3.select(svgView.svgSelector);
    const group = svg.select("g");
    renderer(group, graph);
    svg.attr("width", graph.graph().width);
    svg.attr("height", graph.graph().height);
}
