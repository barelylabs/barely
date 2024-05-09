'use client';

import type { CountdownProps as CountdownPrimitiveProps } from 'react-countdown';
import { cn } from '@barely/lib/utils/cn';
import CountdownPrimitive from 'react-countdown';

interface CountdownProps extends CountdownPrimitiveProps {
	showZeros?: boolean;
	showZeroMinutes?: boolean;
	timesUpMessage?: string;
}

export function Countdown({
	date,
	className,
	showZeros,
	showZeroMinutes,
	timesUpMessage,
	...props
}: CountdownProps) {
	const renderer = ({
		days,
		hours,
		minutes,
		seconds,
		completed,
	}: {
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
		completed: boolean;
	}) => {
		if (completed) {
			return <span>{timesUpMessage ?? "Time's up!"}</span>;
		} else {
			return (
				<div className={cn('flex flex-row gap-2 text-4xl font-bold', className)}>
					{showZeros ?? days > 0 ?
						<>
							<div className='flex flex-col items-center'>
								<span>{days.toString().padStart(2, '0')}</span>
								<span className='text-base font-normal'>Days</span>
							</div>
							<span>:</span>
						</>
					:	null}
					{showZeros ?? days > 0 ?? hours > 0 ?
						<>
							<div className='flex flex-col items-center'>
								<span>{hours.toString().padStart(2, '0')}</span>
								<span className='text-base font-normal'>Hours</span>
							</div>
							<span>:</span>
						</>
					:	null}
					{showZeroMinutes ?? showZeros ?? days > 0 ?? hours > 0 ?? minutes > 0 ?
						<>
							<div className='flex flex-col items-center'>
								<span>{minutes.toString().padStart(2, '0')}</span>
								<span className='text-base font-normal'>Minutes</span>
							</div>
							<span>:</span>
						</>
					:	null}

					<>
						<div className='flex flex-col items-center'>
							<span>{seconds.toString().padStart(2, '0')}</span>
							<span className='text-base font-normal'>Seconds</span>
						</div>
					</>
				</div>
			);
		}
	};

	return (
		<CountdownPrimitive date={date} {...props} renderer={props.renderer ?? renderer} />
	);
}
