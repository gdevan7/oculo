import cors from "cors";
import express from "express";
import { createGlassesRouter } from "../modules/glasses/glasses.routes.js";
import { createRequireAdmin } from "./adminAuth.js";
import { errorHandler, notFoundHandler } from "./errorHandler.js";

// Builds the Express app from its parts, so tests and server.js can plug in different ones.
export function createApp({ config, glassesService, checkDatabase }) {
  const app = express();
  app.use(cors({ origin: config.frontendOrigin }));
  app.use(express.json({ limit: "32kb" }));

  app.get("/api/health", async (_req, res, next) => {
    try {
      res.json({ status: "ok", database: await checkDatabase() });
    } catch (error) {
      next(error);
    }
  });
  app.use("/api/glasses", createGlassesRouter({ service: glassesService, requireAdmin: createRequireAdmin(config.adminApiKey) }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
