import type {
	BooleanEdge,
	FlowState,
	SimpleEdge,
} from '@barely/lib/server/routes/flow/flow.ui.types';
import type { BezierEdgeProps } from '@xyflow/react';
import { useState } from 'react';
import { cn } from '@barely/lib/utils/cn';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
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

	const [insertPopoverOpen, setInsertPopoverOpen] = useState(false);

	return (
		<>
			<BaseEdge {...simpleEdge} path={path} />
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
						<Popover open={insertPopoverOpen} onOpenChange={setInsertPopoverOpen}>
							<div className='group p-4'>
								<PopoverTrigger asChild>
									<Button
										variant='icon'
										look='muted'
										pill
										startIcon='plus'
										size='xs'
										className={cn(
											'invisible scale-0 transition-all group-hover:visible group-hover:scale-100',
											insertPopoverOpen && 'visible scale-100',
										)}
									/>
								</PopoverTrigger>
							</div>
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
	const { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition } =
		booleanEdge;

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

	const canInsertNode = canInsertNodeInEdge(booleanEdge.id);

	const [insertPopoverOpen, setInsertPopoverOpen] = useState(false);
	return (
		<>
			<BaseEdge {...booleanEdge} path={path} />
			<EdgeLabelRenderer>
				<div
					style={{
						position: 'absolute',
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						fontSize: 12,
						pointerEvents: 'all',
					}}
				>
					<div className='group relative p-1'>
						<div className='rounded-md border border-border bg-background p-[2px]'>
							{booleanEdge.data.boolean ? 'Yes' : 'No'}
						</div>
						<div
							className={cn(
								'invisible absolute left-1/2 top-full z-10 -translate-x-1/2 scale-0 transition-all hover:visible hover:scale-100 group-hover:visible group-hover:scale-100',
								insertPopoverOpen && 'visible scale-100',
								insertPopoverOpen && 'visible scale-100',
							)}
						>
							{canInsertNode ?
								<Popover open={insertPopoverOpen} onOpenChange={setInsertPopoverOpen}>
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
												onClick={() => insertActionNodeInEdge(booleanEdge.id, 'wait')}
											/>
											<Button
												look='muted'
												size='sm'
												variant='icon'
												startIcon='email'
												onClick={() =>
													insertActionNodeInEdge(booleanEdge.id, 'sendEmail')
												}
											/>
											<Button
												look='muted'
												size='sm'
												variant='icon'
												startIcon='mailchimp'
												onClick={() =>
													insertActionNodeInEdge(booleanEdge.id, 'addToMailchimpAudience')
												}
											/>
										</div>
									</PopoverContent>
								</Popover>
							:	null}
						</div>
						<div className='absolute inset-0 -bottom-6' />
					</div>
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
