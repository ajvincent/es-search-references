import path from "node:path";
import { fileURLToPath, } from "node:url";
import express from "express";

const projectRoot = path.normalize(path.join(fileURLToPath(import.meta.url), "../../../.."));
console.log(projectRoot);

const app = express();
app.use("/", express.static(path.join(projectRoot, "docs")));
app.listen(3000);
console.log('Express started on port 3000');
