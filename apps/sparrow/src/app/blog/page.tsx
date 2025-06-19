import { H } from '@barely/ui/elements/typography';

import { AnimatedSection } from '../../components/marketing/AnimatedSection';
import { BlogCard } from '../../components/blog/BlogCard';
import { getAllPosts } from '../../lib/blog';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="pt-16">
      {/* Page Header */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedSection animation="fade-up">
            <H size="1" className="text-5xl md:text-6xl lg:text-7xl font-heading mb-6">
              Music Marketing Insights
            </H>
            <p className="text-xl md:text-2xl text-white/70">
              Data-driven strategies for independent artists navigating the modern music industry
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {posts.length === 0 ? (
            <AnimatedSection animation="fade-up">
              <div className="text-center py-12">
                <p className="text-white/60">No blog posts yet. Check back soon!</p>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <AnimatedSection key={post.slug} animation="fade-up" delay={index * 100}>
                  <BlogCard post={post} />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}