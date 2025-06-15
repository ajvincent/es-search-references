import { OrderedStringMap } from "../utilities/OrderedStringMap.js";
export class WebFSSubRoot {
    fileType;
    #children = new OrderedStringMap;
    children = this.#children;
    constructor(fileType) {
        this.fileType = fileType;
    }
}
