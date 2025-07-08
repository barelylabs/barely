'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';

export function CreateFlowButton() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const router = useRouter();

	const [loading, setLoading] = useState(false);

	const { mutateAsync: createFlow } = useMutation({
		...trpc.flow.create.mutationOptions(),
		onSuccess: res => {
			router.push(`/${handle}/flows/${res.flowId}`);
		},
	});

	return (
		<Button
			onClick={async () => {
				setLoading(true);
				await createFlow({
					handle,
				});
				setLoading(false);
			}}
			loading={loading}
			className='space-x-3'
		>
			<p>New Flow</p>
			<kbd className='hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block'>
				C
			</kbd>
		</Button>
	);
}
