// app/api/recurring-expenses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET all recurring expenses
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

    const recurring = await prisma.recurringExpense.findMany({
      where: { businessId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recurring);
  } catch (error) {
    console.error("GET recurring expenses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST new recurring expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, name, amount, categoryId, frequency, startDate, endDate } = body;

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const recurring = await prisma.recurringExpense.create({
      data: {
        name,
        amount,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        categoryId,
        businessId,
        isActive: true,
      },
      include: { category: true },
    });

    return NextResponse.json(recurring, { status: 201 });
  } catch (error) {
    console.error("POST recurring expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}