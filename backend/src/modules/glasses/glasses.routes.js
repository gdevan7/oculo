import { Router } from "express";
import { toApi } from "./glasses.model.js";

// Thin HTTP layer: read the request, call the service, send JSON. No business rules here.
export function createGlassesRouter({ service, requireAdmin }) {
  const router = Router();
  const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

  router.get("/", handle(async (_req, res) => {
    res.json({ data: (await service.list()).map(toApi) });
  }));

  router.get("/:id", handle(async (req, res) => {
    res.json({ data: toApi(await service.get(req.params.id)) });
  }));

  router.post("/", requireAdmin, handle(async (req, res) => {
    res.status(201).json({ data: toApi(await service.create(req.body)) });
  }));

  router.patch("/:id", requireAdmin, handle(async (req, res) => {
    res.json({ data: toApi(await service.update(req.params.id, req.body)) });
  }));

  router.delete("/:id", requireAdmin, handle(async (req, res) => {
    await service.remove(req.params.id);
    res.status(204).end();
  }));

  return router;
}
