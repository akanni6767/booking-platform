// app/api/invoices/[id]/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        business: { userId: session.user.id },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // TODO: Implement actual email sending here
    // For now, just update status to SENT
    
    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: "SENT" },
      include: { items: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Send invoice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}