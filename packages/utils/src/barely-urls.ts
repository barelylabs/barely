// todo - use eslint to only allow this import in the api package
export { getBaseUrl, getAbsoluteUrl } from '@barely/auth/get-url';

export const getSearchParams = (url: string) => {
	// Create a params object
	const params = {} as Record<string, string>;

	new URL(url).searchParams.forEach(function (val, key) {
		params[key] = val;
	});

	return params;
};
