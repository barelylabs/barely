import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { H } from '@barely/ui/elements/typography';
import { Icon } from '@barely/ui/elements/icon';

import { AnimatedSection } from '../../../components/marketing/AnimatedSection';
import { BlogMDX } from '../../../components/blog/BlogMDX';
import { MarketingButton } from '../../../components/marketing/Button';
import { getPostBySlug, getAllPosts } from '../../../lib/blog';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="pt-16">
      {/* Back to Blog */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/blog" className="inline-flex items-center text-white/60 hover:text-white transition-colors">
            <Icon.chevronLeft className="w-4 h-4 mr-1" />
            Back to Blog
          </Link>
        </div>
      </section>

      {/* Post Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-12">
              <H size="1" className="text-4xl md:text-5xl lg:text-6xl font-heading mb-6">
                {post.title}
              </H>
              
              <div className="flex items-center justify-center gap-3 text-white/60 mb-8">
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    {post.authorAvatar ? (
                      <img 
                        src={post.authorAvatar} 
                        alt={post.author}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white/60">
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span>{post.author}</span>
                </div>
                <span>•</span>
                <time dateTime={post.date}>{formattedDate}</time>
              </div>
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {post.tags.map(tag => (
                    <span 
                      key={tag}
                      className="text-sm px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Post Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up" delay={200}>
            <BlogMDX markdown={post.content} />
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedSection animation="fade-up">
            <H size="3" className="mb-4">Ready to Apply These Strategies?</H>
            <p className="text-white/70 mb-8">
              Get personalized guidance for your music marketing journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <MarketingButton marketingLook="hero-primary">
                  Explore Our Services
                </MarketingButton>
              </Link>
              <a 
                href="https://app.usemotion.com/meet/barely/discovery" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MarketingButton marketingLook="scientific">
                  Book Free Strategy Call
                </MarketingButton>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}