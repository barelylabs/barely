"use client";

import type { ReactNode } from "react";
import React, { useMemo } from "react";
import { api } from "@barely/api/react";
import { transformer } from "@barely/api/transformer";
import { pageSessionAtom } from "@barely/atoms/session.atom";
import { useWorkspaceHandle } from "@barely/hooks/use-workspace";
import { getUrl } from "@barely/lib/utils/url";
import { ThemeProvider } from "@barely/ui/elements/next-theme-provider";
import { TooltipProvider } from "@barely/ui/elements/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { Provider as JotaiProvider, useAtomValue } from "jotai";

export function TRPCReactProvider(props: {
  children: ReactNode;
  headers?: Headers;
}) {
  const pageSession = useAtomValue(pageSessionAtom);

  const workspaceHandle = useWorkspaceHandle();

  const [queryClient, trpcClient] = useMemo(() => {
    const headers = new Map(props.headers);
    headers.set("x-trpc-source", "nextjs-react");
    headers.set("x-page-session-id", pageSession.id);
    headers.set("x-workspace-handle", workspaceHandle ?? "");
    const preparedHeaders = Object.fromEntries(headers);

    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 1000, // 5 seconds
        },
      },
    });

    const trpc = api.createClient({
      transformer,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),

        (runtime) => {
          const servers = {
            node: httpBatchLink({
              url: getUrl("app", "api/node"),
              headers() {
                return preparedHeaders;
              },
            })(runtime),

            edge: httpBatchLink({
              url: getUrl("app", "api/edge"),
              headers() {
                return preparedHeaders;
              },
            })(runtime),
          };

          return (ctx) => {
            const pathParts = ctx.op.path.split(".");

            let path: string = ctx.op.path;
            let serverName: keyof typeof servers = "edge";

            if (pathParts[0] === "node") {
              pathParts.shift();
              path = pathParts.join(".");
              serverName = "node";
            }

            const link = servers[serverName];

            return link({
              ...ctx,
              op: {
                ...ctx.op,
                path,
              },
            });
          };
        },
      ],
    });

    return [client, trpc];
  }, [workspaceHandle, pageSession.id, props.headers]);

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <ReactQueryStreamedHydration transformer={transformer}>
          {props.children}
        </ReactQueryStreamedHydration>
      </api.Provider>
    </QueryClientProvider>
  );
}

export default function Providers(props: {
  children: ReactNode;
  headers?: Headers;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <JotaiProvider>
        <TooltipProvider delayDuration={100}>
          <TRPCReactProvider headers={props.headers}>
            <>
              {props.children}
              <ReactQueryDevtools initialIsOpen={false} />
            </>
          </TRPCReactProvider>
        </TooltipProvider>
      </JotaiProvider>
    </ThemeProvider>
  );
}
