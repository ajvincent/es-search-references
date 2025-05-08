import {
  d3,
  dagre,
  render as RenderCtor,
} from "../../lib/packages/dagre-imports.js";

import type {
  SVGGraphView,
} from "./views/svg-graph.js";

export function createRenderGraph(
  graph: dagre.graphlib.Graph,
  svgView: SVGGraphView,
): void
{
  graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));

  const renderer = new RenderCtor();
  const svg = d3.select(svgView.svgSelector);
  const group = svg.select("g");
  renderer(group, graph);
  svg.attr("width", graph.graph().width!);
  svg.attr("height", graph.graph().height!);

  addInnerCircle(svg, "heldValues");
  addInnerCircle(svg, "target");
}

function addInnerCircle(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, prefix: string): void {
  const outerCircle = svg.select(`.${prefix}-node circle`);
  outerCircle.clone().attr("r", parseInt(outerCircle.attr("r")) - 6);
}
