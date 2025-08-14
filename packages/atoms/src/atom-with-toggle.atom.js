'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.atomWithToggle = atomWithToggle;
var jotai_1 = require('jotai');
function atomWithToggle(initialValue) {
	var anAtom = (0, jotai_1.atom)(initialValue, function (get, set, nextValue) {
		var update = nextValue !== null && nextValue !== void 0 ? nextValue : !get(anAtom);
		set(anAtom, update);
	});
	return anAtom;
}
