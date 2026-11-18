import "dotenv/config";
import { readConfig } from "./config/env.js";
import { createPool } from "./db/pool.js";
import { createApp } from "./http/app.js";
import { glassesSeed } from "./modules/glasses/glasses.seed.js";
import { createMemoryGlassesRepository } from "./modules/glasses/glasses.repository.memory.js";
import { createPgGlassesRepository } from "./modules/glasses/glasses.repository.pg.js";
import { createGlassesService } from "./modules/glasses/glasses.service.js";

// Composition root: the only place that decides which implementations are used.
const config = readConfig();
const pool = config.databaseUrl ? createPool(config.databaseUrl) : null;
const repository = pool ? createPgGlassesRepository(pool) : createMemoryGlassesRepository(glassesSeed);

const app = createApp({
  config,
  glassesService: createGlassesService(repository),
  checkDatabase: async () => {
    if (!pool) return "memory";
    await pool.query("SELECT 1");
    return "connected";
  },
});

const server = app.listen(config.port, () => console.log(`API listening on ${config.port}`));

async function close() {
  server.close();
  if (pool) await pool.end();
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
