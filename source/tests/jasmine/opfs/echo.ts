import {
  OPFSFileSystemManagerClientImpl
} from "../../../scripts/opfs/client/FileSystemManager.js";

describe("OPFS workers", () => {
  let firstWorker: OPFSFileSystemManagerClientImpl;
  let secondWorker: OPFSFileSystemManagerClientImpl;

  it("can access the file system", async () => {
    firstWorker = await OPFSFileSystemManagerClientImpl.build("tmp/one");
    secondWorker = await OPFSFileSystemManagerClientImpl.build("tmp/two");

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
