'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';

import { Button } from '@barely/ui/elements/button';

export function CreateFlowButton() {
	const { handle } = useWorkspace();
	const router = useRouter();

	const [loading, setLoading] = useState(false);

	const { mutateAsync: createFlow } = api.flow.create.useMutation({
		onSuccess: res => {
			router.push(`/${handle}/flows/${res.flowId}`);
		},
	});

	return (
		<Button
			onClick={async () => {
				setLoading(true);
				await createFlow({});
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
