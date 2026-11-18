import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { readConfig } from "../config/env.js";
import { createPool } from "./pool.js";

// Applies db/schema.sql and then every file in db/migrations/ in name order. All of them are
// written to be safe to repeat, so there is no bookkeeping table.
const dbDir = fileURLToPath(new URL("../../db/", import.meta.url));
const { databaseUrl } = readConfig();
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = createPool(databaseUrl);
try {
  const migrations = (await readdir(`${dbDir}migrations`)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of ["schema.sql", ...migrations.map((f) => `migrations/${f}`)]) {
    await pool.query(await readFile(`${dbDir}${file}`, "utf8"));
    console.log(`applied ${file}`);
  }
} finally {
  await pool.end();
}
