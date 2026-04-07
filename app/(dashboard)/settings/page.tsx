// app/(dashboard)/settings/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { SettingsClient } from "@/components/settings/SettingsClient";

async function getSettingsData(businessId: string) {
  const [business, categories] = await Promise.all([
    prisma.business.findUnique({
      where: { id: businessId },
    }),
    prisma.category.findMany({
      where: { businessId },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ]);

  return { business, categories };
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });

  if (!business) {
    redirect("/auth/signup");
  }

  const data = await getSettingsData(business.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
      </div>

      <SettingsClient 
        business={data.business}
        initialCategories={data.categories}
      />
    </div>
  );
}