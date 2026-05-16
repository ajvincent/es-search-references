import fs from "node:fs/promises";
import path from "node:path";

export async function checkPackage(
  pathToDir: string,
  expectedPackageName: string
): Promise<void>
{
  const packageJSONRaw = await fs.readFile(path.join(pathToDir, "package.json"), { encoding: "utf-8" });
  const packageJSON: Record<"name", string> = JSON.parse(packageJSONRaw);
  if (packageJSON.name !== expectedPackageName)
    throw new Error(expectedPackageName + " package not found!");
  console.log("found package " + expectedPackageName);
}
