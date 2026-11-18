import "dotenv/config";
import { readConfig } from "../config/env.js";
import { glassesSeed } from "../modules/glasses/glasses.seed.js";
import { createPgGlassesRepository } from "../modules/glasses/glasses.repository.pg.js";
import { createPool } from "./pool.js";

// Inserts or updates the seed frames. Frames that are not in the seed are left alone.
const { databaseUrl } = readConfig();
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = createPool(databaseUrl);
try {
  const repository = createPgGlassesRepository(pool);
  for (const glasses of glassesSeed) {
    if (await repository.get(glasses.id)) await repository.update(glasses);
    else await repository.insert(glasses);
    console.log(`seeded ${glasses.id}`);
  }
} finally {
  await pool.end();
}
