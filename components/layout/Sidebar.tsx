// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  FileText, 
  Receipt, 
  BarChart3, 
  Settings, 
  LogOut,
  Building2
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Books
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-4">
          <ThemeToggle />
          
          <div className="flex items-center gap-x-3 px-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {user.name?.charAt(0) || user.email?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name || user.email}
              </p>
            </div>
            <Link
              href="/api/auth/signout"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}