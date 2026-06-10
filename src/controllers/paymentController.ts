import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { Prisma } from "@prisma/client";

export const createIntent = async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { payeeId, amountPaise, clientRef } = req.body as {
    payeeId?: number;
    amountPaise?: number;
    clientRef?: string;
  };

  if (!payeeId || !amountPaise || amountPaise <= 0) {
    return res.status(400).json({ error: "payeeId and positive amountPaise are required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { account: true },
  });
  if (!user || !user.account) {
    return res.status(400).json({ error: "Account not found" });
  }

  const payee = await prisma.payee.findFirst({
    where: { id: payeeId, userId },
  });
  if (!payee) {
    return res.status(404).json({ error: "Payee not found" });
  }

  const intent = await prisma.paymentIntent.create({
    data: {
      userId,
      accountId: user.account.id,
      payeeId: payee.id,
      amountPaise,
      clientRef,
      status: "created",
    },
    include: { payee: true, account: true },
  });

  res.status(201).json(intent);
};

export const confirmIntent = async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const id = Number(req.params.id);

  const intent = await prisma.paymentIntent.findFirst({
    where: { id, userId },
    include: { account: true, payee: true },
  });

  if (!intent) {
    return res.status(404).json({ error: "Payment intent not found" });
  }

  if (intent.status !== "created") {
    return res.status(400).json({ error: `Cannot confirm intent in status ${intent.status}` });
  }

  const account = intent.account;

  if (intent.amountPaise > account.balance) {
    return res.status(400).json({ error: "Insufficient funds" });
  }

  const result = await prisma.$transaction(
  async (tx: Prisma.TransactionClient) => {
    const updatedAccount = await tx.account.update({
      where: { id: account.id },
      data: { balance: { decrement: intent.amountPaise } },
    });

    const txn = await tx.transaction.create({
      data: {
        userId,
        accountId: account.id,
        payeeId: intent.payeeId,
        amountPaise: intent.amountPaise,
        direction: "debit",
        description: "Voice payment",
        status: "success",
      },
    });

    const updatedIntent = await tx.paymentIntent.update({
      where: { id: intent.id },
      data: { status: "confirmed" },
    });

    return { updatedIntent, txn, updatedAccount };
  }
);

  res.json({
    intent: result.updatedIntent,
    transaction: result.txn,
    account: result.updatedAccount,
  });
};

export const getIntent = async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const id = Number(req.params.id);

  const intent = await prisma.paymentIntent.findFirst({
    where: { id, userId },
    include: { account: true, payee: true },
  });

  if (!intent) {
    return res.status(404).json({ error: "Payment intent not found" });
  }

  res.json(intent);
};