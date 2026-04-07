// app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function verifyInvoiceOwnership(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      business: { userId },
    },
    include: { items: true },
  });
  return invoice;
}

// PUT update invoice
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

    const existing = await verifyInvoiceOwnership(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (existing.status === "PAID") {
      return NextResponse.json({ error: "Cannot edit paid invoice" }, { status: 400 });
    }

    const body = await request.json();
    const { clientName, clientEmail, clientAddress, issueDate, dueDate, notes, items, subtotal, taxAmount, total } = body;

    // Delete existing items and create new ones
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        clientName,
        clientEmail,
        clientAddress,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes,
        subtotal,
        taxAmount,
        total,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT invoice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE invoice
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

    const existing = await verifyInvoiceOwnership(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE invoice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}