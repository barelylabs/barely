'use client';

import { useEffect, useRef } from 'react';
import { fmPageApi } from '@barely/lib/server/routes/fm-page/fm-page.api.react';

export function LogVisit({ fmId }: { fmId: string }) {
	const { mutate: logEvent } = fmPageApi.log.useMutation();

	const hasLoggedView = useRef(false);

	useEffect(() => {
		if (hasLoggedView.current) return;

		logEvent({
			fmId,
			type: 'fm/view',
		});

		hasLoggedView.current = true;
	}, [fmId, logEvent]);

	return null;
}
