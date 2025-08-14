'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.localVisitorSessionAtom = exports.pageSessionAtom = void 0;
var utils_1 = require('jotai/utils');
var pageStorage = (0, utils_1.createJSONStorage)(function () {
	return sessionStorage;
});
var pageSession = {
	id: typeof window !== 'undefined' ? window.crypto.randomUUID() : 'server',
	storage: pageStorage,
};
var pageSessionAtom = (0, utils_1.atomWithStorage)('session', pageSession);
exports.pageSessionAtom = pageSessionAtom;
var localVisitorSession = {
	id: typeof window !== 'undefined' ? window.crypto.randomUUID() : 'server',
};
var localVisitorSessionAtom = (0, utils_1.atomWithStorage)(
	'visitorSession',
	localVisitorSession,
);
exports.localVisitorSessionAtom = localVisitorSessionAtom;
