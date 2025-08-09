'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useVipRenderTRPC } from '@barely/api/public/vip-render.trpc.react';

export function VipLogVisit({ vipSwapId }: { vipSwapId: string }) {
	const trpc = useVipRenderTRPC();
	const { mutate: logEvent } = useMutation(trpc.swap.log.mutationOptions());

	const hasLoggedView = useRef(false);

	useEffect(() => {
		if (hasLoggedView.current) return;

		logEvent({
			vipSwapId,
			type: 'vip/view',
		});

		hasLoggedView.current = true;
	}, [vipSwapId, logEvent]);

	return null;
}
