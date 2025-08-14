'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.atomsEnv = void 0;
var env_nextjs_1 = require('@t3-oss/env-nextjs');
var v4_1 = require('zod/v4');
exports.atomsEnv = (0, env_nextjs_1.createEnv)({
	server: {
		DATABASE_URL: v4_1.z.url(),
		DATABASE_POOL_URL: v4_1.z.url(),
	},
	client: {
		NEXT_PUBLIC_PUSHER_APP_KEY: v4_1.z.string(),
		NEXT_PUBLIC_PUSHER_APP_CLUSTER: v4_1.z.string(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
		NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
	},
});
