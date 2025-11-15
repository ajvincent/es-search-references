var _a;
import { JSGraphConstants } from "../../../lib/packages/runSearchesInGuestEngine.js";
export const SVGGraphPopupLocation = {
    x: -150,
    y: 60,
    width: 360,
    height: 100,
};
export class SVGGraphNodeView {
    static popupLocation = {
        x: -150,
        y: 60,
        width: 360,
        height: 100,
    };
    static #iconAndIsStrongMap = new Map([
        [JSGraphConstants.BuiltInJSTypeName.Object, ["{}", true]],
        [JSGraphConstants.BuiltInJSTypeName.Array, ["[]", true]],
        [JSGraphConstants.BuiltInJSTypeName.Function, ["fn", true]],
        [JSGraphConstants.BuiltInJSTypeName.AsyncFunction, ["\u23f1", true]],
        [JSGraphConstants.BuiltInJSTypeName.Set, ["()", true]],
        [JSGraphConstants.BuiltInJSTypeName.WeakSet, ["()", false]],
        [JSGraphConstants.BuiltInJSTypeName.Map, ["#", true]],
        [JSGraphConstants.BuiltInJSTypeName.WeakMap, ["#", false]],
        [JSGraphConstants.BuiltInJSTypeName.Promise, ["\u23f3", true]],
        [JSGraphConstants.BuiltInJSTypeName.Proxy, ["\u2248", true]],
        [JSGraphConstants.BuiltInJSTypeName.Generator, ["*", true]],
        [JSGraphConstants.BuiltInJSTypeName.AsyncGenerator, ["*", true]],
        [JSGraphConstants.BuiltInJSTypeName.ArrayIterator, ["\u23ef", true]],
        [JSGraphConstants.BuiltInJSTypeName.MapIterator, ["\u23ef", true]],
        [JSGraphConstants.BuiltInJSTypeName.SetIterator, ["\u23ef", true]],
        [JSGraphConstants.BuiltInJSTypeName.IteratorHelper, ["\u23ef", true]],
        [JSGraphConstants.BuiltInJSTypeName.WeakRef, ["\u2192", false]],
        [JSGraphConstants.BuiltInJSTypeName.Symbol, ["\u24e2", true]],
        [JSGraphConstants.BuiltInJSTypeName.FinalizationRegistry, ["\u267b", false]],
    ]);
    static #popupTemplateNode = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    static {
        this.#popupTemplateNode.setAttribute("x", SVGGraphPopupLocation.x.toString());
        this.#popupTemplateNode.setAttribute("y", SVGGraphPopupLocation.y.toString());
        this.#popupTemplateNode.setAttribute("width", SVGGraphPopupLocation.width.toString());
        this.#popupTemplateNode.setAttribute("height", SVGGraphPopupLocation.height.toString());
        const template = document.getElementById("svg-node-overlay").content;
        this.#popupTemplateNode.append(template.cloneNode(true));
    }
    static #thisElm = document.createElement("span");
    static {
        this.#thisElm.append("this");
    }
    static #addPopupRow(parent, ...grandchildren) {
        const outerSpan = document.createElement("span");
        outerSpan.append(...grandchildren);
        parent.append(outerSpan);
    }
    #id;
    #node;
    #graphView;
    #popup;
    constructor(id, node, graphView) {
        this.#id = id;
        this.#node = node;
        this.#graphView = graphView;
        if (id === "target:0" || id === "heldValues:1") {
            this.#addInnerCircle();
        }
        const builtInType = node.metadata?.builtInJSTypeName;
        if (builtInType) {
            const iconAndIsStrongRef = _a.#iconAndIsStrongMap.get(builtInType);
            if (iconAndIsStrongRef) {
                const [icon, isStrong] = iconAndIsStrongRef;
                const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textElement.classList.add(icon.length === 1 ? "builtin-icon" : "builtin-icon-pair");
                if (!isStrong)
                    textElement.classList.add("grey");
                textElement.append(icon);
                const titleElement = document.createElementNS("http://www.w3.org/2000/svg", "title");
                titleElement.append(builtInType);
                this.#node.elem.append(textElement, titleElement);
            }
        }
        node.elem.onclick = event => this.#toggleOverlay(event);
    }
    #addInnerCircle() {
        const outerCircle = this.#node.elem.firstElementChild;
        const innerCircle = outerCircle.cloneNode(false);
        const outerRadius = parseInt(outerCircle.getAttribute("r"));
        innerCircle.setAttribute("r", (outerRadius - 6).toString(10));
        outerCircle.after(innerCircle);
    }
    showSelected() {
        this.#node.elem.classList.add("selected");
    }
    hideSelected() {
        this.#node.elem.classList.remove("selected");
    }
    scrollIntoView() {
        this.#node.elem.scrollIntoView({ block: "center", inline: "center" });
    }
    #toggleOverlay(event) {
        event?.preventDefault();
        if (this.#popup) {
            this.#popup.classList.toggle("hidden");
            return;
        }
        this.#popup = _a.#popupTemplateNode.cloneNode(true);
        const transform = this.#node.elem.getAttribute("transform");
        this.#popup.setAttribute("transform", transform);
        const classElement = this.#popup.querySelector(".className");
        if (this.#node.metadata) {
            classElement.append(this.#node.metadata.derivedClassName);
            if (this.#node.metadata.classSpecifier) {
                classElement.classList.add("isLink");
                classElement.onclick = event => this.#handleClassNameClick(event);
            }
        }
        const inEdgesElement = this.#popup.querySelector("in-edges");
        for (const edge of this.#graphView.graph.inEdges(this.#id)) {
            const vIdElm = this.#buildNodeLink(edge.v);
            const nameElm = this.#buildNameElm(edge);
            _a.#addPopupRow(inEdgesElement, vIdElm, nameElm, _a.#thisElm.cloneNode(true));
        }
        const outEdgesElement = this.#popup.querySelector("out-edges");
        for (const edge of this.#graphView.graph.outEdges(this.#id)) {
            const nameElm = this.#buildNameElm(edge);
            const wIdElm = this.#buildNodeLink(edge.w);
            _a.#addPopupRow(outEdgesElement, _a.#thisElm.cloneNode(true), nameElm, wIdElm);
        }
        this.#graphView.popupsParent.append(this.#popup);
    }
    #buildNodeLink(nodeId) {
        const anchorElm = document.createElement("a");
        anchorElm.href = "#";
        anchorElm.onclick = this.#handleNodeIdClick.bind(this, nodeId);
        anchorElm.append(nodeId);
        return anchorElm;
    }
    #buildNameElm(edge) {
        const nameElm = document.createElement("span");
        nameElm.append(edge.name);
        nameElm.classList.add("edge");
        const { isStrongReference } = this.#graphView.graph.edge(edge);
        if (!isStrongReference) {
            nameElm.classList.add("weakreference");
        }
        return nameElm;
    }
    #handleClassNameClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const specifierEvent = new CustomEvent("classClick", {
            detail: {
                classSpecifier: this.#node.metadata.classSpecifier,
                classLineNumber: this.#node.metadata.classLineNumber
            }
        });
        this.#node.elem.dispatchEvent(specifierEvent);
    }
    #handleNodeIdClick(nodeId, event) {
        event.preventDefault();
        event.stopPropagation();
        this.#toggleOverlay();
        this.#graphView.selectNode(nodeId);
    }
}
_a = SVGGraphNodeView;
