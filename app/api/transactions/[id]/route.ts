// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Verify ownership helper
async function verifyTransactionOwnership(transactionId: string, userId: string) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      business: { userId },
    },
  });
  return transaction;
}

// PUT update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await verifyTransactionOwnership(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const body = await request.json();
    const { type, amount, date, categoryId, description, paymentMethod } = body;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        date: new Date(date),
        categoryId,
        description,
        paymentMethod,
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await verifyTransactionOwnership(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}