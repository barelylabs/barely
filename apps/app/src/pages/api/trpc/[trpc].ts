import { createNextApiHandler } from '@trpc/server/adapters/next';
import { createContext } from '@barely/api';
import { appRouter } from '@barely/api';

export const config = {
	runtime: 'nodejs',
};

export default createNextApiHandler({
	router: appRouter,
	createContext,
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
