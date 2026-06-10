import { Router } from "express";
import { authRequired } from "../middleware/authMiddleware";
import {
  createPayee,
  listPayees,
  getPayeeById,
  getPayeeByAlias,
} from "../controllers/payeeController";

export const payeeRouter = Router();

payeeRouter.use(authRequired);

payeeRouter.post("/", createPayee);
payeeRouter.get("/", listPayees);
payeeRouter.get("/:id", getPayeeById);
payeeRouter.get("/by-alias/:alias", getPayeeByAlias);