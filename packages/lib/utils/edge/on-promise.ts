import { SyntheticEvent } from 'react';

function onPromise<T>(promise: (event: SyntheticEvent) => Promise<T>) {
	return (event: SyntheticEvent) => {
		if (promise) {
			promise(event).catch(error => {
				console.log('Unexpected error', error);
			});
		}
	};
}

export { onPromise };
