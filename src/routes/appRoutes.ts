import { Router } from "express";
import { authRequired } from "../middleware/authMiddleware";
import { getAppConfig } from "../controllers/appController";

export const appRouter = Router();

appRouter.use(authRequired);

appRouter.get("/config", getAppConfig);