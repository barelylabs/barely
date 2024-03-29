import type { ChangeEvent } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onPromise<T>(promise: (event: ChangeEvent<any>) => Promise<T>) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (event: React.ChangeEvent<any>) => {
		if (promise) {
			promise(event).catch(error => {
				console.log('Unexpected error', error);
			});
		}
	};
}

export { onPromise };
