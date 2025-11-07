'use client';

import Image from 'next/image';
import Link from 'next/link';

const PLAYLISTS = [
	{
		name: 'Chill Roadtrip',
		image: '/_static/playlists/chill_roadtrip.jpg',
		url: 'https://open.spotify.com/playlist/3FtpQGKXdkuz0PwJ6e2iIu',
	},
	{
		name: 'Indie Drive',
		image: '/_static/playlists/indie_drive.jpg',
		url: 'https://open.spotify.com/playlist/0m2n7Kmcyc9bjTdgzHAPVe',
	},
	{
		name: 'Indie Folk',
		image: '/_static/playlists/indie_folk.jpg',
		url: 'https://open.spotify.com/playlist/6ZyOQSL4U5gLDPyrbWaWO7',
	},
	{
		name: 'Nostalgia',
		image: '/_static/playlists/nostalgia.jpg',
		url: 'https://open.spotify.com/playlist/1xbIK2Z0B2vXDhlmVmEFem',
	},
];

export function PlaylistCarousel() {
	return (
		<div className="w-full overflow-x-auto scrollbar-hide">
			<div className="flex gap-4 px-4 py-2 sm:gap-6 sm:px-6 lg:px-8">
				{PLAYLISTS.map(playlist => (
					<Link
						key={playlist.name}
						href={playlist.url}
						target="_blank"
						rel="noopener noreferrer"
						className="group relative flex-shrink-0 w-48 sm:w-56 lg:w-64"
					>
						<div className="relative aspect-square overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105">
							<Image
								src={playlist.image}
								alt={playlist.name}
								fill
								className="object-cover transition-opacity duration-300 group-hover:opacity-80"
								sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 256px"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
								<p className="font-semibold text-lg">{playlist.name}</p>
							</div>
						</div>
						<p className="mt-2 text-center font-medium text-gray-200 group-hover:text-white transition-colors">
							{playlist.name}
						</p>
					</Link>
				))}
			</div>
		</div>
	);
}
