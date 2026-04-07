// app/api/business/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// PUT update business profile
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

    const body = await request.json();
    const { name, ownerName, email, address, currency, logo } = body;

    const business = await prisma.business.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const updated = await prisma.business.update({
      where: { id },
      data: {
        name,
        ownerName,
        email,
        address,
        currency,
        logo,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update business error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}