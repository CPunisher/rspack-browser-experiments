import path from "node:path";
import fs from "node:fs";

export function serializeDirectoryToMemFS(directoryPath: string) {
  const result = {};

  function processDirectory(currentPath: string, relativePath = currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const relativeFilePath = path.join(relativePath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        processDirectory(fullPath, relativeFilePath);
      } else {
        const content = fs.readFileSync(fullPath, "utf-8");
        result[relativeFilePath] = content;
      }
    }
  }

  processDirectory(directoryPath);
  return result;
}
