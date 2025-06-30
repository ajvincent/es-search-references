export interface OPFSFileSystemIfc {
  echo(token: string): Promise<{token: string, pathToRoot: string}>;
  getFileSystems(): Promise<{[key: string]: string}>;
  setFileSystemKey(key: string): Promise<void>;
}
