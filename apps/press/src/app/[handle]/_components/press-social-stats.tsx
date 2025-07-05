import { Icon } from '@barely/ui/icon';

import { nFormatter } from '@barely/utils';

import { Section, SectionDiv } from '~/app/[handle]/_components/press-section';

export interface SocialStat {
	icon?: keyof typeof Icon;
	label: string;
	value: number;
}

export function SocialStat({ icon = 'stat', label, value }: SocialStat) {
	const SocialIcon = Icon[icon];

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex flex-row items-center gap-2'>
				<SocialIcon className='h-5 w-5' />
				<p className='text-2xl font-bold'>{nFormatter(value)}</p>
			</div>
			<p className='text-sm text-gray-500'>{label}</p>
		</div>
	);
}

export function SocialStats({ stats }: { stats: SocialStat[] }) {
	return (
		<Section id='stats'>
			<SectionDiv title='Social Stats'>
				<div className='grid grid-cols-2 gap-4 text-left sm:grid-cols-3 lg:grid-cols-5'>
					{stats.map((stat, index) => {
						return <SocialStat key={index} {...stat} />;
					})}
				</div>
			</SectionDiv>
		</Section>
	);
}
