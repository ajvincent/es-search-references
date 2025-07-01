import {
  OPFSFileSystemClientImpl
} from "../../../scripts/opfs/client/FileSystemManager.js";

describe("OPFS workers", () => {
  let firstWorker: OPFSFileSystemClientImpl;
  let secondWorker: OPFSFileSystemClientImpl;

  it("can access the file system", async () => {
    firstWorker = await OPFSFileSystemClientImpl.build("tmp/one");
    secondWorker = await OPFSFileSystemClientImpl.build("tmp/two");

    const results = Promise.all([
      firstWorker.echo("alpha"),
      secondWorker.echo("beta")
    ]);

    await expectAsync(results).toBeResolvedTo([
      {
        token: "alpha",
        pathToRoot: "tmp/one",
      },

      {
        token: "beta",
        pathToRoot: "tmp/two"
      }
    ]);
  });
});
