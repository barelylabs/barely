import { TRPCError } from '@trpc/server';

export const raise = (err: unknown): never => {
	throw typeof err === 'string' ? new Error(err) : err;
};

export const raiseTRPCError = ({
	message,
	code = 'INTERNAL_SERVER_ERROR',
}: {
	message: string;
	code?: TRPCError['code'];
}): never => {
	throw new TRPCError({
		code,
		message,
	});
};
