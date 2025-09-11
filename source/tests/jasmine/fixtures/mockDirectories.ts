import type {
  TopDirectoryRecord,
  DirectoryRecord
} from "../../../scripts/opfs/types/WebFileSystemIfc.js";

const mockDirectories = {
  packages: {
    "es-search-references": {
      "red": "const RED = { value: 'red' };\n export { RED };\n"
    }
  },

  urls: {
    one: {
      two: {
        "three.js": "const THREE = { value: 3 };\nexport { THREE };\n",
        "four.js": "const FOUR = { value: 4 };\nexport { FOUR };\n",
      },
      five: {
        "six.js": "const SIX = { value: 6 };\nexport { SIX };\n",
      },
    },

    seven: {
      "eight.js": "const EIGHT = { value: 8 };\nexport { EIGHT };\n",
    }
  }
};
mockDirectories satisfies TopDirectoryRecord;

const mockDirectoryRecord = {
  "es-search-references": {
    "red": "const RED = { value: 'red' };\n export { RED };\n"
  },

  "one://": {
    two: {
      "three.js": "const THREE = { value: 3 };\nexport { THREE };\n",
      "four.js": "const FOUR = { value: 4 };\nexport { FOUR };\n",
    },
    five: {
      "six.js": "const SIX = { value: 6 };\nexport { SIX };\n",
    },
  },

  "seven://": {
    "eight.js": "const EIGHT = { value: 8 };\nexport { EIGHT };\n",
  }
};
mockDirectoryRecord satisfies DirectoryRecord;

export {
  mockDirectories,
  mockDirectoryRecord,
};
