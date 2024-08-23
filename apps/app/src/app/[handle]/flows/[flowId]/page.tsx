import { FlowBuilder } from '~/app/[handle]/flows/[flowId]/_components/flow-builder';

export default function FlowsPage() {
	return (
		<div className='flex h-full flex-col items-center justify-center'>
			<FlowBuilder />
		</div>
	);
}
