import { setCorsHeaders } from "@barely/lib/utils/cors";
import { createTRPCContext } from "@barely/server/api";
import { edgeRouter } from "@barely/server/api/router.edge";
import { auth } from "@barely/server/auth";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const runtime = "edge";

export function OPTIONS() {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
}

const handler = auth(async (req): Promise<Response> => {
  const response = await fetchRequestHandler({
    endpoint: "/api/edge",
    router: edgeRouter,
    req,
    createContext: () => createTRPCContext({ auth: req.auth, req }),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });

  setCorsHeaders(response);
  return response;
}) as unknown as () => Promise<Response>; // fixme: related to the issue here: https://github.com/t3-oss/create-t3-turbo/issues/800

export { handler as GET, handler as POST };
