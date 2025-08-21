'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import { useBioContext } from '@barely/ui/src/bio';

export function BioLogVisit() {
	const { bio } = useBioContext();
	const trpc = useBioRenderTRPC();
	const { mutate: logEvent } = useMutation(trpc.bio.log.mutationOptions());

	const hasLoggedView = useRef(false);

	useEffect(() => {
		if (hasLoggedView.current) return;

		logEvent({
			bioId: bio.id,
			type: 'bio/view',
		});

		hasLoggedView.current = true;
	}, [bio.id, logEvent]);

	return null;
}
