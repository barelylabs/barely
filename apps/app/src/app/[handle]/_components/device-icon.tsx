import { BlurImage } from '@barely/ui/blur-image';
import { Icon } from '@barely/ui/icon';

import type { DeviceTabs } from '~/app/[handle]/_components/stat-devices';

export default function DeviceIcon({
	display,
	tab,
	className,
}: {
	display: string;
	tab: DeviceTabs;
	className: string;
}) {
	switch (tab) {
		case 'Device':
			return (
				<BlurImage
					src={
						display === 'Desktop' ?
							`https://faisalman.github.io/ua-parser-js/images/types/default.png`
						:	`https://faisalman.github.io/ua-parser-js/images/types/${display.toLowerCase()}.png`
					}
					alt={display}
					width={20}
					height={20}
					sizes='10vw'
					className={className}
				/>
			);
		case 'Browser':
			if (display === 'Chrome') {
				return <Icon.chrome className={className} />;
			} else if (display === 'Safari' || display === 'Mobile Safari') {
				return <Icon.safari className={className} />;
			} else {
				return (
					<BlurImage
						src={`https://faisalman.github.io/ua-parser-js/images/browsers/${display.toLowerCase()}.png`}
						alt={display}
						width={20}
						height={20}
						className={className}
					/>
				);
			}
		case 'OS':
			if (display === 'Mac OS') {
				return (
					<BlurImage
						src='/_static/icons/macos.png'
						alt={display}
						width={20}
						height={20}
						className='h-4 w-4'
					/>
				);
			} else if (display === 'iOS') {
				return <Icon.apple className='-ml-1 h-5 w-5' />;
			} else {
				return (
					<BlurImage
						src={`https://faisalman.github.io/ua-parser-js/images/os/${display.toLowerCase()}.png`}
						alt={display}
						width={30}
						height={20}
						className='h-4 w-5'
					/>
				);
			}
		default:
			return (
				<BlurImage
					src={`https://faisalman.github.io/ua-parser-js/images/companies/default.png`}
					alt={display}
					width={20}
					height={20}
					className={className}
				/>
			);
	}
}
