// https://trpc.io/docs/data-transformers#how-to-1

import * as devalue from 'devalue';
import superjson from 'superjson';

export function stringifyOnServer(obj: any) {
	return superjson.stringify(obj);
}

export function parseOnServer(obj: any) {
	return superjson.parse(obj);
}

export function serializeOnClient(obj: any) {
	return devalue.stringify(obj);
	
}

// export function deserialize(obj: any) {
// 	return eval(`(${obj})`);
// }
