'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.atomWithDebounce = atomWithDebounce;
var jotai_1 = require('jotai');
function atomWithDebounce(initialValue, delayMilliseconds, shouldDebounceOnReset) {
	if (delayMilliseconds === void 0) {
		delayMilliseconds = 500;
	}
	if (shouldDebounceOnReset === void 0) {
		shouldDebounceOnReset = false;
	}
	var prevTimeoutAtom = (0, jotai_1.atom)(undefined);
	// not exposed to the outside world
	var _currentValueAtom = (0, jotai_1.atom)(initialValue);
	var isDebouncingAtom = (0, jotai_1.atom)(false);
	var debouncedValueAtom = (0, jotai_1.atom)(initialValue, function (get, set, update) {
		clearTimeout(get(prevTimeoutAtom));
		var prevValue = get(_currentValueAtom);
		var nextValue = typeof update === 'function' ? update(prevValue) : update;
		var onDebounceStart = function () {
			set(_currentValueAtom, nextValue);
			set(isDebouncingAtom, true);
		};
		var onDebounceEnd = function () {
			set(debouncedValueAtom, nextValue);
			set(isDebouncingAtom, false);
		};
		onDebounceStart();
		if (!shouldDebounceOnReset && nextValue === initialValue) {
			onDebounceEnd();
			return;
		}
		var nextTimeoutId = setTimeout(function () {
			onDebounceEnd();
		}, delayMilliseconds);
		// set previous timeout atom in case it needs to get cleared
		set(prevTimeoutAtom, nextTimeoutId);
	});
	// exported atom setter to clear timeout if needed
	var clearTimeoutAtom = (0, jotai_1.atom)(null, function (get, set, _arg) {
		clearTimeout(get(prevTimeoutAtom));
		set(isDebouncingAtom, false);
	});
	return {
		currentValueAtom: (0, jotai_1.atom)(function (get) {
			return get(_currentValueAtom);
		}),
		isDebouncingAtom: isDebouncingAtom,
		clearTimeoutAtom: clearTimeoutAtom,
		debouncedValueAtom: debouncedValueAtom,
	};
}
