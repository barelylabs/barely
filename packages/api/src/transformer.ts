import superjson from "superjson";
export const transformer = superjson;

/* https://trpc.io/docs/data-transformers */
// import superjson from 'superjson';
// import * as devalue from 'devalue';
// // import { _json } from '@barely/utils';

// export const transformer = {
// 	input: superjson,
// 	output: {
// 		serialize: (obj: any) => devalue.stringify(obj),
// 		deserialize: (obj: any) => eval(`(${obj})`),
// 	},
// };
