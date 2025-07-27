import Link from 'next/link';

import { Img } from '@barely/ui/img';
import { H } from '@barely/ui/typography';

import type { BlogPost } from '../../lib/blog';

interface BlogCardProps {
	post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
	const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return (
		<Link href={`/blog/${post.slug}`}>
			<article className='glass glow-card-purple rounded-xl p-6 transition-all duration-150 hover:scale-[1.02]'>
				<div className='mb-3 flex items-center gap-2 text-sm text-white/60'>
					<div className='flex items-center gap-2'>
						<div className='relative h-5 w-5 overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20'>
							{post.authorAvatar ?
								<Img
									src={post.authorAvatar}
									alt={post.author}
									width={20}
									height={20}
									className='h-full w-full object-cover'
								/>
							:	<div className='flex h-full w-full items-center justify-center text-xs font-bold text-white/60'>
									{post.author.charAt(0).toUpperCase()}
								</div>
							}
						</div>
						<span>{post.author}</span>
					</div>
					<span>•</span>
					<time dateTime={post.date}>{formattedDate}</time>
				</div>

				<H
					size='4'
					className='mb-3 text-white transition-colors group-hover:text-purple-300'
				>
					{post.title}
				</H>

				<p className='mb-4 line-clamp-3 text-white/70'>{post.excerpt}</p>

				{post.tags.length > 0 && (
					<div className='flex flex-wrap gap-2'>
						{post.tags.map(tag => (
							<span
								key={tag}
								className='rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-xs text-purple-300'
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</article>
		</Link>
	);
}
