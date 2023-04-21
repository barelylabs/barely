const wait = async (time?: number) => {
	return await new Promise(resolve => setTimeout(resolve, time ?? 1000));
};

export { wait };
