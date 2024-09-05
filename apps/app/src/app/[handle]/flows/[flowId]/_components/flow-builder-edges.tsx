import type {
	BooleanEdge,
	FlowState,
	SimpleEdge,
} from '@barely/lib/server/routes/flow/flow.ui.types';
import type { BezierEdgeProps } from '@xyflow/react';
import { BaseEdge, BezierEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@barely/ui/elements/button';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/elements/popover';

import { useFlowStore } from '~/app/[handle]/flows/[flowId]/_components/flow-store';

const selector = (state: FlowState) => ({
	canInsertNodeInEdge: state.canInsertNodeInEdge,
	insertActionNodeInEdge: state.insertActionNodeInEdge,
});

export function SimpleEdgeType(simpleEdge: SimpleEdge & BezierEdgeProps) {
	const { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition } =
		simpleEdge;

	const [path, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const { canInsertNodeInEdge, insertActionNodeInEdge } = useFlowStore(
		useShallow(selector),
	);

	const canInsertNode = canInsertNodeInEdge(simpleEdge.id);

	return (
		<>
			<BaseEdge
				{...simpleEdge}
				path={path}
				className='bg-red'
				//  className={cn(simpleEdge.className, 'bg-red')}
			/>
			<EdgeLabelRenderer>
				<div
					style={{
						position: 'absolute',
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						fontSize: 12,
						// everything inside EdgeLabelRenderer has no pointer events by default
						// if you have an interactive element, set pointer-events: all
						pointerEvents: 'all',
					}}
				>
					{canInsertNode ?
						<Popover>
							<PopoverTrigger asChild>
								<Button variant='icon' look='muted' pill startIcon='plus' size='xs' />
							</PopoverTrigger>
							<PopoverContent className='w-auto p-2'>
								<div
									className='grid auto-cols-fr gap-2'
									style={{
										gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
										maxWidth: 'calc(4 * (24px + 0.5rem))',
									}}
								>
									<Button
										look='muted'
										size='sm'
										variant='icon'
										startIcon='wait'
										onClick={() => insertActionNodeInEdge(simpleEdge.id, 'wait')}
									/>
									<Button
										look='muted'
										size='sm'
										variant='icon'
										startIcon='email'
										onClick={() => insertActionNodeInEdge(simpleEdge.id, 'sendEmail')}
									/>
									{/* <Button
										look='muted'
										size='sm'
										variant='icon'
										startIcon='branch'
										onClick={() => insertActionNodeInEdge(simpleEdge.id, 'boolean')}
									/> */}
									<Button
										look='muted'
										size='sm'
										variant='icon'
										startIcon='mailchimp'
										onClick={() =>
											insertActionNodeInEdge(simpleEdge.id, 'addToMailchimpAudience')
										}
									/>
								</div>
							</PopoverContent>
						</Popover>
					:	null}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}

export function BooleanEdgeType(booleanEdge: BooleanEdge & BezierEdgeProps) {
	return (
		<>
			<BezierEdge {...booleanEdge} label={booleanEdge.data.boolean ? 'Yes' : 'No'} />
		</>
	);
}
