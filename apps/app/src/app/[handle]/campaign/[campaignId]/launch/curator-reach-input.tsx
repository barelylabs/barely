'use client';

// import { Label, Slider } from '@barely/ui';
// import { fieldAtom, useFieldActions } from 'form-atoms';
import { Label } from '@barely/ui/elements/label';

// import { Slider } from '@barely/ui/elements/slider';

// interface PitchReachInputProps {
// 	minCurators: number;
// 	maxCurators: number;
// }

// const curatorReachFieldAtom = fieldAtom({
// 	name: 'curatorReach',
// 	value: [3],
// });

const CuratorReachInput = () => {
	// const curatorReachActions = useFieldActions(curatorReachFieldAtom);

	return (
		<>
			<Label>How many curator reviews would you like?</Label>
			{/* <Slider
				min={props.minCurators}
				max={props.maxCurators}
				step={1}
				fieldAtom={curatorReachFieldAtom}
				onValueChange={v => curatorReachActions.setValue(v)}
				growThumb
			/> */}
		</>
	);
};

export { CuratorReachInput };
