'use client';

import { Label, Slider } from '@barely/ui';
import { fieldAtom, useFieldActions } from 'form-atoms';

interface PitchReachInputProps {
	minCurators: number;
	maxCurators: number;
}

const curatorReachFieldAtom = fieldAtom({
	name: 'curatorReach',
	value: [3],
});

const CuratorReachInput = (props: PitchReachInputProps) => {
	const curatorReachActions = useFieldActions(curatorReachFieldAtom);

	return (
		<>
			<Label>How many curator reviews would you like?</Label>
			<Slider
				fieldAtom={curatorReachFieldAtom}
				onValueChange={v => curatorReachActions.setValue(v)}
				min={props.minCurators}
				max={props.maxCurators}
				step={1}
				growThumb
			/>
		</>
	);
};

export { CuratorReachInput, curatorReachFieldAtom };
