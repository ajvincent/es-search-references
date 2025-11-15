import type {
  dagre
} from "../../../lib/packages/dagre-imports.js";

export interface SVGGraphViewIfc {
  readonly graph: Pick<dagre.graphlib.Graph, "inEdges" | "outEdges" | "edge">;
  selectNode(nodeId: string): void;
  readonly popupsParent: SVGGElement;
}
