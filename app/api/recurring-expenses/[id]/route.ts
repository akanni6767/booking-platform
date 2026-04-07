// app/api/recurring-expenses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// DELETE recurring expense
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

    const recurring = await prisma.recurringExpense.findFirst({
      where: {
        id,
        business: { userId: session.user.id },
      },
    });

    if (!recurring) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.recurringExpense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE recurring expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}