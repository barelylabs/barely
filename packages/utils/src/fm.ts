import type { FmPage } from '@barely/validators/schemas';

import { getAbsoluteUrl } from './barely-urls';

export function getFmPageUrlFromFmPage(fmPage: FmPage) {
	return getAbsoluteUrl('fm', `${fmPage.handle}/${fmPage.key}`);
}
