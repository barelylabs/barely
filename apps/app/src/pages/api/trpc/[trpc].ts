import { appRouter } from "@barely/api";
import { createApiContext } from "@barely/api/src/context/apiContext";
import { createNextApiHandler } from "@trpc/server/adapters/next";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createApiContext,
});

// If you need to enable cors, you can do so like this:
// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   // Enable cors
//   await cors(req, res);

//   // Let the tRPC handler do its magic
//   return createNextApiHandler({
//     router: appRouter,
//     createContext,
//   })(req, res);
// };

// export default handler;
