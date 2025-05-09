import {
  d3,
  dagre,
  render as RenderCtor,
} from "../../lib/packages/dagre-imports.js";

import type {
  SVGGraphView,
} from "./views/svg-graph.js";

type SelectionAlias = d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

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

  addIconAndTitle(svg, "Object", "{}", true);
  addIconAndTitle(svg, "Array", "[]", true);
  addIconAndTitle(svg, "Function", "fn", true);
  addIconAndTitle(svg, "AsyncFunction", "\u23f1", true);
  addIconAndTitle(svg, "Set", "()", true);
  addIconAndTitle(svg, "WeakSet", "()", false);
  addIconAndTitle(svg, "Map", "#", true);
  addIconAndTitle(svg, "WeakMap", "#", false);
  addIconAndTitle(svg, "Promise", "\u23f3", true);
  addIconAndTitle(svg, "Proxy", "\u2248", true);
  addIconAndTitle(svg, "GeneratorPrototype", "*", true);
  addIconAndTitle(svg, "AsyncGeneratorPrototype", "*", true);
  addIconAndTitle(svg, "ArrayIteratorPrototype", "\u23ef", true);
  addIconAndTitle(svg, "MapIteratorPrototype", "\u23ef", true);
  addIconAndTitle(svg, "SetIteratorPrototype", "\u23ef", true);
  addIconAndTitle(svg, "WeakRef", "\u2192", false);
  addIconAndTitle(svg, "FinalizationRegistry", "\u267b", false);
}

function addInnerCircle(svg: SelectionAlias, prefix: string): void {
  const outerCircle = svg.select(`.${prefix}-node circle`);
  outerCircle.clone().attr("r", parseInt(outerCircle.attr("r")) - 6);
}

function addIconAndTitle(svg: SelectionAlias, builtIn: string, icon: string, isStrong: boolean): void {
  const selection = svg.selectAll(`.nodes > .builtin-${builtIn}`);
  let classes: string = icon.length === 1 ? "builtin-icon" : "builtin-icon-pair";
  if (!isStrong) {
    classes += " grey";
  }
  selection.append("text").classed(classes, true).text(icon);
  selection.append("title").text(builtIn);
}
