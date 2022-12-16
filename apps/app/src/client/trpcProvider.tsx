"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";

import { trpc } from "./trpc";

export type TRPCProviderProps = {
  children: React.ReactNode;
};
export const TRPCProvider = ({ children }: TRPCProviderProps) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/api/trpc" })],
      transformer: superjson,
    }),
  );

  return (
    <trpc.Provider abortOnUnmount client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
