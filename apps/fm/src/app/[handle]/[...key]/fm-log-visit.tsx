'use client';

import { useEffect, useRef } from 'react';
import { useFmPageTRPC } from '@barely/api/public/fm-page.trpc.react';
import { useMutation } from '@tanstack/react-query';

export function LogVisit({ fmId }: { fmId: string }) {
	const trpc = useFmPageTRPC();
	const { mutate: logEvent } = useMutation(trpc.log.mutationOptions());

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
