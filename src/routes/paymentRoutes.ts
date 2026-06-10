import { Router } from "express";
import { authRequired } from "../middleware/authMiddleware";
import {
  createIntent,
  confirmIntent,
  getIntent,
} from "../controllers/paymentController";

export const paymentRouter = Router();

paymentRouter.use(authRequired);

paymentRouter.post("/intents", createIntent);
paymentRouter.post("/intents/:id/confirm", confirmIntent);
paymentRouter.get("/intents/:id", getIntent);