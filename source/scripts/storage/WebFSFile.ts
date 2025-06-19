import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSFileIfc,
  /*
  WebFSFileStaticIfc,
  */
} from "./types/WebFileSystem.js";

export class WebFSFile implements WebFSFileIfc {
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

  constructor(
    contents: string,
  )
  {
    this.contents = contents;
  }

  // WebFSNodeBaseIfc
  readonly fileType = WebFSFileType.FILE;

  // WebFSFileIfc
  contents: string;

  /*
  // WebFSFileIfc
  toJSON(): string {
    return this.contents;
  }

  // WebFSFileIfc
  toZippable(): Uint8Array {
    return WebFSFile.#encoder.encode(this.contents);
  }
  */
}
/*
WebFSFile satisfies WebFSFileStaticIfc;
*/
