import { createTRPCContext } from '@trpc/tanstack-react-query';

// import { createTRPCContext } from '@barely/lib/trpc';
import type { AppRouter } from './app.router';

export const {
	TRPCProvider: TRPCProvider,
	useTRPC: useTRPC,
	useTRPCClient: useTRPCClient,
} = createTRPCContext<AppRouter>();

// const trpc = useTRPC();

// const { mutate: getPresigned, isPending: isPendingPresigns } = useMutation(
// 	trpc.file.getPresigned.mutationOptions(),
// );
