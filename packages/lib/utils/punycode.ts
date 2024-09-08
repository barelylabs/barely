//https://github.com/dubinc/dub/blob/d73151c9ced5b8c5dd32246b025f56595ad2ce09/packages/utils/src/functions/punycode.ts#L4

import punycodeHelper from 'punycode/';

export function punycode(str?: string | null) {
	if (typeof str !== 'string') return '';
	try {
		return punycodeHelper.toUnicode(str);
	} catch (e) {
		return str;
	}
}

export function punyEncode(str?: string | null) {
	if (typeof str !== 'string') return '';
	return punycodeHelper.toASCII(str);
}
