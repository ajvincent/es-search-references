import { WebFSFileType } from "./constants.js";
export class WebFSFile {
    /*
    static readonly #encoder = new TextEncoder();
    static readonly #decoder = new TextDecoder;
    */
    /*
    static fromJSON(contents: string): WebFSFileIfc {
      return new WebFSFile(contents);
    }
  
    static fromZippable(array: Uint8Array): WebFSFileIfc {
      return new WebFSFile(WebFSFile.#decoder.decode(array));
    }
    */
    constructor(contents) {
        this.contents = contents;
    }
    // WebFSNodeBaseIfc
    fileType = WebFSFileType.FILE;
    // WebFSFileIfc
    contents;
}
/*
WebFSFile satisfies WebFSFileStaticIfc;
*/
