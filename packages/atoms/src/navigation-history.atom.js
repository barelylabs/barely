'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.navHistoryAtom = void 0;
var utils_1 = require('jotai/utils');
var pageStorage = (0, utils_1.createJSONStorage)(function () {
	return sessionStorage;
});
var navHistory = {
	currentPath: null,
	settingsBackPath: null,
	history: [],
	storage: pageStorage,
};
exports.navHistoryAtom = (0, utils_1.atomWithStorage)('navigationHistory', navHistory);
