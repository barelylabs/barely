'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@barely/lib/utils/cn';
import { H } from '@barely/ui/elements/typography';

import { AnimatedSection } from './AnimatedSection';
import { MarketingButton } from './Button';
import { allCaseStudies } from '../../data/case-studies';

// Extract testimonials from case studies
const testimonials = allCaseStudies
  .filter(study => study.testimonial)
  .map(study => ({
    id: study.id,
    quote: study.testimonial.quote,
    artistName: study.artistName,
    genre: study.genre,
    metric: study.metrics.after.monthlyListeners > 10000 
      ? `${(study.metrics.after.monthlyListeners / 1000).toFixed(0)}k monthly listeners`
      : study.merchRevenue 
      ? `$${study.merchRevenue.after.toLocaleString()}/mo merch`
      : `+${Math.round(((study.metrics.after.monthlyListeners - study.metrics.before.monthlyListeners) / study.metrics.before.monthlyListeners) * 100)}% growth`,
    avatarUrl: study.avatarUrl
  }));

export function ArtistTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  if (!current || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)`,
        }} />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection animation="fade-up">
            <H size="2" className="text-center mb-16 text-4xl md:text-5xl">
              Real Artists. <span className="gradient-text">Real Results.</span>
            </H>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <div className="relative">
              {/* Large Testimonial Display */}
              <Link href={`/case-studies/${current.id}`}>
                <div className="group relative">
                  {/* Background gradient that moves on hover */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                  
                  <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                    <div className={cn(
                      "transition-all duration-500",
                      isAnimating && "opacity-0 translate-y-4"
                    )}>
                      {/* Large Quote Mark */}
                      <div className="text-6xl text-purple-500/20 font-serif leading-none mb-4">&ldquo;</div>
                      
                      {/* Quote */}
                      <blockquote className="text-2xl md:text-3xl lg:text-4xl text-white/90 mb-12 leading-relaxed font-light">
                        {current.quote}
                      </blockquote>

                      {/* Artist Info with Metric */}
                      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                          {current.avatarUrl && (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/20">
                              <img 
                                src={current.avatarUrl} 
                                alt={current.artistName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-xl font-semibold text-white">{current.artistName}</div>
                            <div className="text-white/60">{current.genre}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-3xl font-bold text-green-500">{current.metric}</div>
                          <div className="text-purple-300 group-hover:text-purple-200 transition-colors flex items-center gap-2">
                            <span>Read Story</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Progress Indicators */}
              <div className="flex gap-3 justify-center mt-12">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setCurrentIndex(index);
                        setIsAnimating(false);
                      }, 300);
                    }}
                    className={cn(
                      "h-1 rounded-full transition-all duration-500",
                      index === currentIndex 
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 w-12" 
                        : "bg-white/20 hover:bg-white/30 w-6"
                    )}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* CTA */}
          <AnimatedSection animation="fade-up" delay={400}>
            <div className="text-center mt-16">
              <p className="text-white/60 mb-6">Join hundreds of artists building sustainable careers</p>
              <Link href="/case-studies">
                <MarketingButton marketingLook="hero-secondary" size="lg">
                  View All Success Stories
                </MarketingButton>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}