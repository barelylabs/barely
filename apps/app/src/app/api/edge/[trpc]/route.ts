import { setCorsHeaders } from "@barely/lib/utils/cors";
import { edgeRouter } from "@barely/server/api/router.edge";
import { createTRPCContext } from "@barely/server/api/trpc";
import { auth } from "@barely/server/auth";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import type { NextAuthRequest } from "@barely/server/auth";

export const runtime = "edge";

export function OPTIONS() {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
}

const createContext = async (req: NextAuthRequest) => {
  return await createTRPCContext({
    session: req.auth,
    headers: req.headers,
  });
};

const handler = auth(async (req) => {
  console.log("edge api handler :: node version: ", process.version);

  const response = await fetchRequestHandler({
    endpoint: "/api/edge",
    router: edgeRouter,
    req,
    createContext: () => createContext(req),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });

  console.log("edge api handler :: response", response);

  setCorsHeaders(response);

  console.log("edge api handler :: response with cors headers", response);
  return response;
});

export { handler as GET, handler as POST };
