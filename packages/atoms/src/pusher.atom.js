'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.pusherSocketIdAtom = exports.pusherAtom = void 0;
var jotai_1 = require('jotai');
var utils_1 = require('jotai/utils');
var pusher_js_1 = require('pusher-js');
var env_1 = require('./env');
var pusher;
if (pusher_js_1.default.instances.length) {
	pusher = pusher_js_1.default.instances[0];
	if (pusher !== undefined) {
		pusher.connect();
	} else {
		pusher = new pusher_js_1.default(env_1.atomsEnv.NEXT_PUBLIC_PUSHER_APP_KEY, {
			cluster: env_1.atomsEnv.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
			disableStats: true,
		});
	}
} else {
	pusher = new pusher_js_1.default(env_1.atomsEnv.NEXT_PUBLIC_PUSHER_APP_KEY, {
		cluster: env_1.atomsEnv.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
		disableStats: true,
	});
}
exports.pusherAtom = (0, utils_1.atomWithStorage)('pusher', pusher);
exports.pusherSocketIdAtom = (0, jotai_1.atom)(function (get) {
	var pusher = get(exports.pusherAtom);
	return pusher.connection.socket_id;
});
