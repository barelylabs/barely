'use client';

interface TimelineItem {
	month: string;
	event: string;
	metric: string;
}

interface CaseStudyTimelineProps {
	timeline: TimelineItem[];
}

export function CaseStudyTimeline({ timeline }: CaseStudyTimelineProps) {
	return (
		<div className='relative'>
			{/* Vertical line */}
			<div className='absolute bottom-0 left-8 top-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500' />

			<div className='space-y-8'>
				{timeline.map((item, index) => (
					<div key={index} className='relative flex items-start gap-6'>
						{/* Dot */}
						<div className='relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-purple-500 bg-[#0A0A0B]'>
							<div className='h-3 w-3 rounded-full bg-purple-500' />
						</div>

						{/* Content */}
						<div className='glass flex-1 rounded-xl p-6'>
							<p className='mb-2 text-sm font-medium text-purple-300'>{item.month}</p>
							<p className='mb-3 text-lg text-white'>{item.event}</p>
							<p className='text-sm font-semibold text-green-500'>{item.metric}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
