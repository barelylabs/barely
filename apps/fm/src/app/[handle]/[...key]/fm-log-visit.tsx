'use client';

import { useEffect } from 'react';
import { fmPageApi } from '@barely/lib/server/routes/fm-page/fm-page.api.react';

export function LogVisit({ fmId }: { fmId: string }) {
	const { mutate: logEvent } = fmPageApi.logEvent.useMutation();

	useEffect(() => {
		logEvent({
			fmId,
			type: 'fm/view',
		});
	}, [fmId, logEvent]);

	return null;
}
