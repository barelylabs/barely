import { ReactNode } from 'react';
import { IconType } from 'react-icons/lib';

interface TimelinePointProps {
	id?: string;
	icon?: IconType;
	color?: string;
	content: ReactNode;
}

export function TimelineVertical({ points }: { points: TimelinePointProps[] }) {
	return points.length ? (
		<div className='flex flex-col'>
			{points.map((point, index) => (
				<div
					id={point.id}
					key={`timeline.${index}`}
					className='flex w-full pt-8 sm:space-x-6'
				>
					<div className='relative hidden items-center sm:flex sm:flex-col'>
						<a href={`#${point.id}`}>
							<div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-50'>
								<div
									className={`h-6 w-6 rounded-full object-center bg-${
										point.color ?? 'gray'
									}-500 `}
								/>
							</div>
						</a>
						<div
							className={`h-full w-[3px] bg-gray-200 ${
								index < points.length - 1 ? '-mb-20' : ''
							}`}
						/>
					</div>
					<div className={` ${index < points.length - 1 ? 'pb-4' : ''}`}>
						{point.content}
					</div>
				</div>
			))}
		</div>
	) : (
		<></>
	);
}
