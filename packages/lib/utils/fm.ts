import type { FmPage } from '../server/routes/fm/fm.schema';
import { getAbsoluteUrl } from './url';

export function getFmPageUrlFromFmPage(fmPage: FmPage) {
	return getAbsoluteUrl('fm', `${fmPage.handle}/${fmPage.key}`);
}
