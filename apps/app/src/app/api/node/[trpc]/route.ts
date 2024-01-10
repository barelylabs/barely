import { createTRPCContext } from "@barely/server/api";
import { nodeRouter } from "@barely/server/api/router.node";
import { auth } from "@barely/server/auth";
import { setCorsHeaders } from "@barely/utils/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const runtime = "nodejs";

export function OPTIONS() {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
}

const handler = auth(async (req): Promise<Response> => {
  const response = await fetchRequestHandler({
    endpoint: "/api/node",
    router: nodeRouter,
    req,
    createContext: () => createTRPCContext({ auth: req.auth, req }),
  });

  setCorsHeaders(response);
  return response;
}) as unknown as () => Promise<Response>; // fixme: related to the issue here: https://github.com/t3-oss/create-t3-turbo/issues/800

export { handler as GET, handler as POST };
