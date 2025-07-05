export const raise = (err: unknown): never => {
	throw typeof err === 'string' ? new Error(err) : err;
};
