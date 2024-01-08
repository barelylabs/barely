'use client';

import { useContainerHeight, useContainerWidth } from '@barely/lib/hooks/use-container';
import ReactConfetti from 'react-confetti';
import Confetti from 'react-dom-confetti';

const ConfettiRain = (props: {
	fillContainer?: boolean;
	recycle?: boolean;
	tweenDuration?: number;
	numberOfPieces?: number;
}) => {
	const [containerWidth] = useContainerWidth();
	const [containerHeight] = useContainerHeight();

	const w = props.fillContainer ? containerWidth : window.innerWidth;
	const h = props.fillContainer ? containerHeight : 1.2 * window.innerHeight;

	return (
		<ReactConfetti
			width={w}
			height={h}
			recycle={false}
			tweenDuration={10000}
			numberOfPieces={1500}
		/>
	);
};

export function ConfettiBurst({
	active = false,
	elementCount = 200,
	spread = 100,
}: {
	active?: boolean;
	elementCount?: number;
	spread?: number;
}) {
	return (
		<Confetti
			active={active}
			config={{
				elementCount,
				spread,
			}}
		/>
	);
}

export { ConfettiRain as ConfettiRain };
