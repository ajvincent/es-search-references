await import("./dagre-d3.js");

const { graphlib, dagre, d3, render } = dagreD3;
export { graphlib, dagre, d3, render };
delete globalThis.dagreD3;
