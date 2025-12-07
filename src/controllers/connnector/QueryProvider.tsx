"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Never becomes stale
      gcTime: Infinity, // Never garbage collected
      refetchOnWindowFocus: false, // No refetch on tab focus
      refetchOnReconnect: false, // No refetch on internet reconnect
      refetchOnMount: false, // No refetch when component remounts
      retry: false, // No retry = no extra "pings"
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
