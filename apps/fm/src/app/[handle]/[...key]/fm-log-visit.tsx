'use client';

import { useEffect, useRef } from 'react';
import { fmPageApi } from '@barely/lib/server/routes/fm-page/fm-page.api.react';

export function LogVisit({ fmId }: { fmId: string }) {
	const { mutate: logEvent } = fmPageApi.logEvent.useMutation();

	const hasLoggedView = useRef(false);

	useEffect(() => {
		// console.log('fmId', fmId);
		// console.log('hasLoggedView.current', hasLoggedView.current);

		if (hasLoggedView.current) return;

		logEvent({
			fmId,
			type: 'fm/view',
		});

		hasLoggedView.current = true;
	}, [fmId, logEvent]);

	return null;
}
