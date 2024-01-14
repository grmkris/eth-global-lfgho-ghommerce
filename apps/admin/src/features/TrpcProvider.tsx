import { ENV } from "@/env.ts";
import { createClient } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpcClient } from "./trpc-client.ts";

export const queryClient = new QueryClient();

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "http://127.0.0.1:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
);

let token: string;
export function setToken(newToken: string) {
  /**
   * You can also save the token to cookies, and initialize from
   * cookies above.
   */
  console.log("newToken", newToken);
  token = newToken;
}

export function TrpcProvider(props: {
  children?: React.ReactNode;
}) {
  const [combinedClient] = useState(() => {
    return trpcClient.createClient({
      links: [
        httpBatchLink({
          url: `${ENV.VITE_API_URL}/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
          headers: () => {
            return {
              Authorization: `Bearer ${token}`,
            };
          },
        }),
      ],
    });
  });

  return (
    <trpcClient.Provider client={combinedClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpcClient.Provider>
  );
}
