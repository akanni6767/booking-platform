// app/auth/layout.tsx
"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center gap-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Books
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}