#!/usr/bin/env node

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const builtCliPath = resolve(currentDir, "../dist/bin/vib.js");

if (!existsSync(builtCliPath)) {
  console.error(
    "Missing compiled CLI at dist/bin/vib.js. Run `pnpm build` or use `pnpm dev`.",
  );
  process.exit(1);
}

await import(pathToFileURL(builtCliPath).href);
