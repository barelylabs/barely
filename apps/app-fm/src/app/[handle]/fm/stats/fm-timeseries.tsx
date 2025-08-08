'use client';

import { useFmStatFilters, useWorkspace } from '@barely/hooks';
import { calcPercent, cn, nFormatter } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { AreaChart } from '@barely/ui/charts/area-chart';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

import { WebEventFilterBadges } from '~/app/[handle]/_components/filter-badges';

export function FmTimeseries() {
	const {
		filtersWithHandle,
		uiFilters,
		formatTimestamp,
		badgeFilters,
		toggleShowVisits,
		toggleShowClicks,
		toggleSpotify,
		toggleAppleMusic,
		toggleYoutube,
		toggleAmazonMusic,
		toggleYoutubeMusic,
	} = useFmStatFilters();

	const {
		showVisits,
		showClicks,
		showSpotify,
		showAppleMusic,
		showYoutube,
		showAmazonMusic,
		showYoutubeMusic,
	} = uiFilters;

	const trpc = useTRPC();
	const { data: timeseries } = useSuspenseQuery(
		trpc.stat.fmTimeseries.queryOptions(
			{ ...filtersWithHandle },
			{
				select: data =>
					data.map(row => ({
						...row,
						date: formatTimestamp(row.start),
					})),
			},
		),
	);

	const totalVisits = timeseries.reduce((acc, row) => acc + row.fm_views, 0);
	const totalClicks = timeseries.reduce((acc, row) => acc + row.fm_linkClicks, 0);

	const totalSpotifyClicks = timeseries.reduce(
		(acc, row) => acc + row.fm_spotifyClicks,
		0,
	);
	const totalAppleMusicClicks = timeseries.reduce(
		(acc, row) => acc + row.fm_appleMusicClicks,
		0,
	);
	const totalYoutubeClicks = timeseries.reduce(
		(acc, row) => acc + row.fm_youtubeClicks,
		0,
	);
	const totalAmazonMusicClicks = timeseries.reduce(
		(acc, row) => acc + row.fm_amazonMusicClicks,
		0,
	);
	const totalYoutubeMusicClicks = timeseries.reduce(
		(acc, row) => acc + row.fm_youtubeMusicClicks,
		0,
	);

	const chartData = timeseries.map(row => ({
		...row,
		visits: showVisits ? row.fm_views : undefined,
		clicks: showClicks ? row.fm_linkClicks : undefined,
		spotify: showSpotify && totalSpotifyClicks ? row.fm_spotifyClicks : undefined,
		appleMusic:
			showAppleMusic && totalAppleMusicClicks ? row.fm_appleMusicClicks : undefined,
		youtube: showYoutube && totalYoutubeClicks ? row.fm_youtubeClicks : undefined,
		amazonMusic:
			showAmazonMusic && totalAmazonMusicClicks ? row.fm_amazonMusicClicks : undefined,
		youtubeMusic:
			showYoutubeMusic && totalYoutubeMusicClicks ? row.fm_youtubeMusicClicks : undefined,
	}));

	return (
		<Card className='p-6'>
			<div className='flex flex-row items-center justify-between'>
				<div className='flex flex-row'>
					<button
						type='button'
						className={cn(
							'flex flex-col gap-1 rounded-tl-md py-3 pl-3 pr-8',
							showVisits && 'border-b-3 border-slate-500 bg-slate-100',
						)}
						onClick={toggleShowVisits}
					>
						<div className='flex flex-row items-center gap-1'>
							<div className='m-auto mb-0.5 rounded-sm bg-slate-500 p-[3px]'>
								<Icon.view className='h-3.5 w-3.5 text-white' />
							</div>
							<Text variant='sm/medium' className='uppercase'>
								VISITS
							</Text>
						</div>
						<H size='4'>{totalVisits}</H>
					</button>

					<button
						type='button'
						className={cn(
							'flex flex-col gap-1 py-3 pl-4 pr-8',
							showClicks && 'border-b-3 border-blue-500 bg-blue-100',
						)}
						onClick={toggleShowClicks}
					>
						<div className='flex flex-row items-center gap-1'>
							<div className='m-auto rounded-sm bg-blue p-0.5'>
								<Icon.click className='mb-[1px] h-3.5 w-3.5 text-white' />
							</div>
							<Text variant='sm/medium' className='uppercase'>
								CLICKS
							</Text>
						</div>
						<div className='flex flex-row items-baseline gap-1'>
							<H size='4'>{totalClicks}</H>
							<Text
								variant='sm/medium'
								className='uppercase tracking-[-.05em] text-muted-foreground'
							>
								({calcPercent(totalClicks, totalVisits)})
							</Text>
						</div>
					</button>
					<div
						className={cn(
							'flex flex-col gap-1 rounded-tr-md border-slate-300 bg-slate-50 py-3 pl-4 pr-8',
						)}
					>
						<PlatformClicks
							fmId={filtersWithHandle.assetId}
							totalSpotify={totalSpotifyClicks}
							totalAppleMusic={totalAppleMusicClicks}
							totalYoutube={totalYoutubeClicks}
							totalAmazonMusic={totalAmazonMusicClicks}
							totalYoutubeMusic={totalYoutubeMusicClicks}
							showSpotify={showSpotify}
							showAppleMusic={showAppleMusic}
							showYoutube={showYoutube}
							showAmazonMusic={showAmazonMusic}
							showYoutubeMusic={showYoutubeMusic}
							toggleSpotify={toggleSpotify}
							toggleAppleMusic={toggleAppleMusic}
							toggleYoutube={toggleYoutube}
							toggleAmazonMusic={toggleAmazonMusic}
							toggleYoutubeMusic={toggleYoutubeMusic}
						/>
					</div>
				</div>

				<div className='flex flex-row justify-between gap-2'>
					<WebEventFilterBadges filters={badgeFilters} />
				</div>
			</div>

			{/* <pre>{JSON.stringify(chartData, null, 2)}</pre> */}

			<AreaChart
				className='mt-4 h-72'
				data={chartData}
				index='date'
				categories={[
					'visits',
					'clicks',
					'spotify',
					'appleMusic',
					'youtube',
					'amazonMusic',
					'youtubeMusic',
				]}
				colors={['slate', 'blue', 'green', 'red', 'yellow', 'purple', 'pink']}
				showXAxis={true}
				showLegend={false}
				// curveType={filtersWithHandle.dateRange === '1d' ? 'linear' : 'natural'}
				curveType='linear'
				yAxisWidth={30}
				valueFormatter={v => nFormatter(v)}
			/>
		</Card>
	);
}

const PlatformClicks = ({
	fmId,
	totalSpotify,
	totalAppleMusic,
	totalYoutube,
	totalAmazonMusic,
	totalYoutubeMusic,
	showSpotify,
	showAppleMusic,
	showYoutube,
	showAmazonMusic,
	showYoutubeMusic,
	toggleSpotify,
	toggleAppleMusic,
	toggleYoutube,
	toggleAmazonMusic,
	toggleYoutubeMusic,
}: {
	fmId?: string;
	totalSpotify: number;
	totalAppleMusic: number;
	totalYoutube: number;
	totalAmazonMusic: number;
	totalYoutubeMusic: number;
	showSpotify?: boolean;
	showAppleMusic?: boolean;
	showYoutube?: boolean;
	showAmazonMusic?: boolean;
	showYoutubeMusic?: boolean;
	toggleSpotify: () => void;
	toggleAppleMusic: () => void;
	toggleYoutube: () => void;
	toggleAmazonMusic: () => void;
	toggleYoutubeMusic: () => void;
}) => {
	const { handle } = useWorkspace();
	const trpc = useTRPC();
	const { data: platforms } = useSuspenseQuery(
		trpc.fm.byId.queryOptions(
			{ handle, id: fmId ?? '' },
			{
				enabled: !!fmId,
				select: fm => fm?.links.map(link => link.platform),
			},
		),
	);

	const toggles = [
		{
			platform: 'spotify' as const,
			total: totalSpotify,
			show: showSpotify,
			toggle: toggleSpotify,
			fmHas: !fmId || platforms?.some(platform => platform === 'spotify'),
		},
		{
			platform: 'appleMusic' as const,
			total: totalAppleMusic,
			show: showAppleMusic,
			toggle: toggleAppleMusic,
			fmHas: !fmId || platforms?.some(platform => platform === 'appleMusic'),
		},
		{
			platform: 'youtube' as const,
			total: totalYoutube,
			show: showYoutube,
			toggle: toggleYoutube,
			fmHas: !fmId || platforms?.some(platform => platform === 'youtube'),
		},
		{
			platform: 'amazonMusic' as const,
			total: totalAmazonMusic,
			show: showAmazonMusic,
			toggle: toggleAmazonMusic,
			fmHas: !fmId || platforms?.some(platform => platform === 'amazonMusic'),
		},
		{
			platform: 'youtubeMusic' as const,
			total: totalYoutubeMusic,
			show: showYoutubeMusic,
			toggle: toggleYoutubeMusic,
			fmHas: !fmId || platforms?.some(platform => platform === 'youtubeMusic'),
		},
	].sort((a, b) => b.total - a.total);

	return (
		<div className='h-max-full grid auto-cols-max grid-flow-col grid-rows-3 gap-x-4 gap-y-1'>
			{/* <pre>{JSON.stringify(toggles, null, 2)}</pre> */}
			{toggles.map(toggle => {
				if (!toggle.fmHas) return null;

				const PlatformIcon = Icon[toggle.platform];

				return (
					<button
						key={toggle.platform}
						type='button'
						className={cn(
							'bg-slate flex flex-row items-center gap-x-1 gap-y-0.5 rounded-sm p-0.5',
						)}
						onClick={toggle.toggle}
					>
						<PlatformIcon
							className={cn(
								'mb-[1px] h-3 w-3 text-slate-500',
								toggle.show && `text-${toggle.platform}`,
							)}
						/>

						<Text
							variant='xs/medium'
							className={toggle.show ? `text-${toggle.platform}` : 'text-slate-500'}
						>
							{toggle.platform}: {toggle.total}
						</Text>
					</button>
				);
			})}

			{/* <button
				type='button'
				className={cn(
					'bg-slate flex flex-row items-center gap-x-1 gap-y-0.5 rounded-sm p-0.5',
				)}
				onClick={toggleSpotify}
			>
				<Icon.spotify
					className={cn('mb-[1px] h-3 w-3 text-slate-500', showSpotify && 'text-spotify')}
				/>
				<Text
					variant='xs/medium'
					className={showSpotify ? 'text-spotify' : 'text-slate-500'}
				>
					Spotify: {totalSpotify}
				</Text>
			</button>

			<button
				type='button'
				className={cn('bg-slate flex flex-row items-center gap-1 rounded-sm p-0.5')}
				onClick={toggleAppleMusic}
			>
				<Icon.appleMusic
					className={cn(
						'mb-[1px] h-3 w-3 text-slate-500',
						showAppleMusic && 'text-appleMusic',
					)}
				/>
				<Text
					variant='xs/medium'
					className={showAppleMusic ? 'text-appleMusic' : 'text-slate-500'}
				>
					Apple Music: {totalAppleMusic}
				</Text>
			</button>

			<button
				type='button'
				className={cn('bg-slate flex flex-row items-center gap-1 rounded-sm p-0.5')}
				onClick={toggleYoutube}
			>
				<Icon.youtube
					className={cn('mb-[1px] h-3 w-3 text-slate-500', showYoutube && 'text-youtube')}
				/>
				<Text
					variant='xs/medium'
					className={showYoutube ? 'text-youtube' : 'text-slate-500'}
				>
					YouTube: {totalYoutube}
				</Text>
			</button>

			<button
				type='button'
				className={cn('bg-slate flex flex-row items-center gap-1 rounded-sm p-0.5')}
				onClick={toggleAmazonMusic}
			>
				<Icon.amazonMusic
					className={cn(
						'mb-[1px] h-3 w-3 text-slate-500',
						showAmazonMusic && 'text-amazon-music',
					)}
				/>
				<Text
					variant='xs/medium'
					className={showAmazonMusic ? 'text-amazon-music' : 'text-slate-500'}
				>
					Amazon Music: {totalAmazonMusic}
				</Text>
			</button>

			<button
				type='button'
				className={cn('bg-slate flex flex-row items-center gap-1 rounded-sm p-0.5')}
				onClick={toggleYoutubeMusic}
			>
				<Icon.youtubeMusic
					className={cn(
						'mb-[1px] h-3 w-3 text-slate-500',
						showYoutubeMusic && 'text-youtube',
					)}
				/>
				<Text
					variant='xs/medium'
					className={showYoutubeMusic ? 'text-youtube' : 'text-slate-500'}
				>
					YouTube Music: {totalYoutubeMusic}
				</Text>
			</button> */}
		</div>
	);
};
