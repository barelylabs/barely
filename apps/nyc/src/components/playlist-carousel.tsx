'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const PLAYLISTS = [
	{
		name: 'Chill Roadtrip',
		image: '/_static/playlists/chill_roadtrip.jpg',
		url: 'https://open.spotify.com/playlist/3FtpQGKXdkuz0PwJ6e2iIu',
		followers: '6.2k',
	},
	{
		name: 'Indie Drive',
		image: '/_static/playlists/indie_drive.jpg',
		url: 'https://open.spotify.com/playlist/0m2n7Kmcyc9bjTdgzHAPVe',
		followers: '5.9k',
	},
	{
		name: 'Indie Folk',
		image: '/_static/playlists/indie_folk.jpg',
		url: 'https://open.spotify.com/playlist/6ZyOQSL4U5gLDPyrbWaWO7',
		followers: '2.4k',
	},
	{
		name: 'Nostalgia',
		image: '/_static/playlists/nostalgia.jpg',
		url: 'https://open.spotify.com/playlist/1xbIK2Z0B2vXDhlmVmEFem',
		followers: '3.3k',
	},
];

export function PlaylistCarousel() {
	return (
		<div className='w-full overflow-x-auto scrollbar-hide'>
			<div className='mx-auto flex max-w-6xl justify-start gap-4 px-4 py-2 sm:gap-6 sm:px-6 lg:justify-center lg:px-8'>
				{PLAYLISTS.map(playlist => (
					<Link
						key={playlist.name}
						href={playlist.url}
						target='_blank'
						rel='noopener noreferrer'
						className='group relative w-32 flex-shrink-0 last:mr-4 sm:w-48 sm:last:mr-6 lg:last:mr-8'
					>
						<div className='relative aspect-square overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105'>
							<Image
								src={playlist.image}
								alt={playlist.name}
								fill
								className='object-cover transition-opacity duration-300 group-hover:opacity-80'
								sizes='(max-width: 640px) 128px, 192px'
							/>
							<div className='absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
								<ExternalLink className='h-8 w-8 text-white' />
							</div>
						</div>
						<div className='mt-2'>
							<p className='text-sm font-medium text-white'>{playlist.name}</p>
							<p className='text-xs text-gray-400'>{playlist.followers} Followers</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
