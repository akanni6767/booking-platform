// app/providers.tsx (Session Provider for Client Components)
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}