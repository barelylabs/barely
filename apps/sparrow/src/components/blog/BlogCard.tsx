import Link from 'next/link';
import { H } from '@barely/ui/elements/typography';

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
      <article className="glass glow-card-purple rounded-xl p-6 hover:scale-[1.02] transition-all duration-150">
        <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              {post.authorAvatar ? (
                <img 
                  src={post.authorAvatar} 
                  alt={post.author}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/60">
                  {post.author.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span>{post.author}</span>
          </div>
          <span>•</span>
          <time dateTime={post.date}>{formattedDate}</time>
        </div>
        
        <H size="4" className="mb-3 text-white group-hover:text-purple-300 transition-colors">
          {post.title}
        </H>
        
        <p className="text-white/70 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span 
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
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