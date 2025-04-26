import type { graphlib } from "@dagrejs/dagre";

export class SearchResults {
  logs: string[] = [];
  graph: graphlib.Graph | null = null;
}
