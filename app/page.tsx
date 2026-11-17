import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  Building2,
  ArrowLeftRight,
  FileText,
  BarChart3,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

const features = [
  {
    name: "Transactions",
    description: "Track income and expenses by category with payment methods and dates.",
    icon: ArrowLeftRight,
  },
  {
    name: "Invoicing",
    description: "Create invoices with line items, tax, PDF export, and payment status.",
    icon: FileText,
  },
  {
    name: "Recurring expenses",
    description: "Schedule repeating costs so they stay reflected in your books.",
    icon: Receipt,
  },
  {
    name: "Reports & dashboard",
    description: "P&L, cash flow, aging, and charts to see how the business is doing.",
    icon: BarChart3,
  },
] as const;

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isSignedIn = !!session?.user;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Books
            </span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Open dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Small-business bookkeeping
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Your finances, invoices, and reports in one place
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Books helps you record transactions, send invoices, manage recurring expenses,
              and understand profit with a dashboard built for owners—not accountants.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Go to dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button variant="primary" size="lg">
                      Create free account
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="secondary" size="lg">
                      I already have an account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
              What you can do
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600 dark:text-gray-400">
              Everything behind the dashboard—transactions, invoices, expenses, settings, and
              reports—is included in this app.
            </p>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <li
                  key={feature.name}
                  className="card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                    <feature.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Books — bookkeeping app built with Next.js, Prisma, and PostgreSQL.</p>
      </footer>
    </div>
  );
}