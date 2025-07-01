export interface OPFSFileSystemIfc {
  echo(token: string): Promise<{token: string, pathToRoot: string}>;
  getFileSystems(): Promise<{[key: string]: string}>;
}
