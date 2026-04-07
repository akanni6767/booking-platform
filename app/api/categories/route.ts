// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// POST new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, name, type, color } = body;

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const existing = await prisma.category.findFirst({
      where: { name, type, businessId },
    });

    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        color,
        businessId,
        isDefault: false,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}