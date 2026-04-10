// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/lib/generated/prisma/client";

// Define CategoryType enum manually
const CategoryType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

// Define the transaction client type
type TransactionClient = Omit<
  PrismaClient,
  "$extends" | "$connect" | "$disconnect" | "$on" | "$use" | "$transaction"
>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, businessName, businessType, ownerName } = body;

    // Validation
    if (!name || !email || !password || !businessName || !businessType || !ownerName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with business and default categories in a transaction
    const user = await prisma.$transaction(async (tx: TransactionClient) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Create business
      const business = await tx.business.create({
        data: {
          name: businessName,
          ownerName,
          type: businessType,
          email,
          userId: newUser.id,
        },
      });

      // Create default income categories
      const incomeCategories = [
        { name: "Sales", color: "#10B981" },
        { name: "Services", color: "#3B82F6" },
        { name: "Consulting", color: "#8B5CF6" },
        { name: "Other Income", color: "#6B7280" },
      ];

      // Create default expense categories
      const expenseCategories = [
        { name: "Rent", color: "#EF4444" },
        { name: "Utilities", color: "#F59E0B" },
        { name: "Payroll", color: "#EC4899" },
        { name: "Supplies", color: "#10B981" },
        { name: "Marketing", color: "#3B82F6" },
        { name: "Insurance", color: "#6366F1" },
        { name: "Maintenance", color: "#8B5CF6" },
        { name: "Other Expenses", color: "#6B7280" },
      ];

      // Create all categories
      await tx.category.createMany({
        data: [
          ...incomeCategories.map((cat) => ({
            ...cat,
            type: CategoryType.INCOME,
            businessId: business.id,
            isDefault: true,
          })),
          ...expenseCategories.map((cat) => ({
            ...cat,
            type: CategoryType.EXPENSE,
            businessId: business.id,
            isDefault: true,
          })),
        ],
      });

      return newUser;
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}