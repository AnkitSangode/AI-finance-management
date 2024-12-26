"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export const updateDefaultAccount = async (accountId) => {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("User not found");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: {
        isDefault: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAccountWithTransactions = async (accountId) => {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("User not found");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!account) throw new Error("Account not found");

    const transactionCount = await db.transaction.count({
      where: { accountId: accountId },
    });

    return {
      ...serializeTransaction(account),
      _count: { transactions: transactionCount },
      transactions: account.transactions.map(serializeTransaction),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const bulkDeleteTransactions = async (transactionIds) => {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("User not found");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: {
        id: {
          in: transactionIds,
        },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "INCOME"
          ? transaction.amount
          : -transaction.amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances

    await db.$transaction(async (tx) => {
      for (const transaction of transactions) {
        await tx.transaction.delete({
          where: {
            id: transaction.id,
          },
        });

        await tx.account.update({
          where: {
            id: transaction.accountId,
          },
          data: {
            balance: {
              decrement: accountBalanceChanges[transaction.accountId],
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    return { success: true };

    
  } catch (error) {
    return { success: false, error: error.message };
  }
};
