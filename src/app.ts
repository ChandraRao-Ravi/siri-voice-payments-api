import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { json } from "body-parser";
import { authRouter } from "./routes/authRoutes";
import { accountRouter } from "./routes/accountRoutes";
import { payeeRouter } from "./routes/payeeRoutes";
import { paymentRouter } from "./routes/paymentRoutes";
import { appRouter } from "./routes/appRoutes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/account", accountRouter);
  app.use("/payees", payeeRouter);
  app.use("/payments", paymentRouter);
  app.use("/app", appRouter);

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status((err as any).statusCode ?? 500).json({
      error: (err as any).message ?? "Internal server error",
    });
  };

  app.use(errorHandler);

  return app;
}