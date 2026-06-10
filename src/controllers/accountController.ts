import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const getAccount = async (req: Request, res: Response) => {
    const userId = req.auth!.userId;

    const account = await prisma.account.findUnique({
        where: { userId },
    });

    if (!account) {
        return res.status(404).json({ error: "Account not found" });
    }

    res.json({
        id: account.id,
        balance: account.balance, // paise
        currency: account.currency,
    });
};

export const getTransactions = async (req: Request, res: Response) => {
    const userId = req.auth!.userId;
    const limit = Number(req.query.limit ?? 5);

    const txns = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { payee: true },
    });

    res.json(
        txns.map((t: any) => ({
            id: t.id,
            amountPaise: t.amountPaise,
            direction: t.direction,
            description: t.description,
            status: t.status,
            createdAt: t.createdAt,
            payee: {
                id: t.payee.id,
                alias: t.payee.alias,
                name: t.payee.name,
            },
        }))
    );
};