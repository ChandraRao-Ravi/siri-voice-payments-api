import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const getAppConfig = async (req: Request, res: Response) => {
  const userId = req.auth!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { account: true },
  });

  if (!user || !user.account) {
    return res.status(400).json({ error: "Account not found" });
  }

  res.json({
    featureFlags: {
      voicePaymentsEnabled: true,
      maxAmountPaise: 50000000, // ₹500,000.00
      requiresBiometrics: true,
    },
    userSummary: {
      id: user.id,
      email: user.email,
      balancePaise: user.account.balance,
      currency: user.account.currency,
    },
  });
};