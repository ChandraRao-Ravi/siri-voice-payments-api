import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const createPayee = async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { alias, name, accountRef } = req.body as {
    alias?: string;
    name?: string;
    accountRef?: string;
  };

  if (!alias || !name || !accountRef) {
    return res.status(400).json({ error: "alias, name, accountRef are required" });
  }

  const payee = await prisma.payee.create({
    data: {
      userId,
      alias,
      name,
      accountRef,
    },
  });

  res.status(201).json(payee);
};

export const listPayees = async (req: Request, res: Response) => {
  const userId = req.auth!.userId;

  const payees = await prisma.payee.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(payees);
};

export const getPayeeById = async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const id = Number(req.params.id);

  const payee = await prisma.payee.findFirst({
    where: { id, userId },
  });

  if (!payee) {
    return res.status(404).json({ error: "Payee not found" });
  }

  res.json(payee);
};

export const getPayeeByAlias = async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const aliasParam = req.params.alias;
  const alias = Array.isArray(aliasParam) ? aliasParam[0] : aliasParam;

  const payee = await prisma.payee.findFirst({
    where: {
      userId,
      alias: { equals: alias, mode: "insensitive" },
    },
  });

  if (!payee) {
    return res.status(404).json({ error: "Payee not found" });
  }

  res.json(payee);
};