import { Router } from "express";
import { authRequired } from "../middleware/authMiddleware";
import { getAccount, getTransactions } from "../controllers/accountController";

export const accountRouter = Router();

accountRouter.use(authRequired);
accountRouter.get("/", getAccount);
accountRouter.get("/transactions", getTransactions);