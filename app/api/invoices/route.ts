// app/api/invoices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET all invoices
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { businessId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    // console.log()
    // console.log("business", business);
    // console.log("session", session);
    // console.log("businessId", businessId);
    // console.log("searchParams", searchParams);
    // console.log("request", request);
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET invoices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST new invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, invoiceNumber, clientName, clientEmail, clientAddress, issueDate, dueDate, notes, items, subtotal, taxAmount, total } = body;

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientName,
        clientEmail,
        clientAddress,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes,
        subtotal,
        taxAmount,
        total,
        status: "DRAFT",
        businessId,
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

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST invoice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}