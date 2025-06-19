import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { H } from '@barely/ui/elements/typography';
import { Icon } from '@barely/ui/elements/icon';

import { AnimatedSection } from '~/components/marketing/AnimatedSection';
import { CaseStudyMetrics } from '~/components/marketing/CaseStudyMetrics';
import { CaseStudyTimeline } from '~/components/marketing/CaseStudyTimeline';
import { MarketingButton } from '~/components/marketing/Button';
import { getCaseStudyById, getAllCaseStudyIds } from '~/data/case-studies';

// Legacy data structure - keeping temporarily for reference
const _legacyCaseStudyData = {
  'bedroom-producer-to-10k': {
    artistName: 'Luna Synthesis',
    genre: 'Electronic/Ambient',
    serviceTier: 'Bedroom+',
    avatarUrl: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=400&fit=crop',
    startDate: 'January 2024',
    endDate: 'May 2024',
    
    // Metrics
    metrics: {
      before: {
        monthlyListeners: 523,
        streams: 2100,
        followers: 89,
        engagementRate: '2.1%',
        emailSubscribers: 0,
        monthlyRevenue: '$18',
      },
      after: {
        monthlyListeners: 10847,
        streams: 45600,
        followers: 2340,
        engagementRate: '5.8%',
        emailSubscribers: 487,
        monthlyRevenue: '$342',
      },
    },
    
    // Investment
    investment: {
      serviceFee: '$800', // 4 months @ $200
      adSpend: '$1,200',
      total: '$2,000',
    },
    
    // Challenge
    challenge: `Luna had been producing high-quality ambient electronic music for 3 years but couldn't break through the algorithmic noise. Despite having a small but dedicated following, growth had plateaued at around 500 monthly listeners.`,
    
    // Strategy
    strategy: [
      {
        title: 'Audience Research & Segmentation',
        description: 'Identified core listeners as "focus work" and "meditation" audiences through data analysis.',
      },
      {
        title: 'Content Positioning',
        description: 'Repositioned tracks with SEO-optimized titles and created themed playlists for different use cases.',
      },
      {
        title: 'Meta Campaign Structure',
        description: 'Built lookalike audiences from engaged Spotify listeners and targeted specific ambient music interests.',
      },
      {
        title: 'Release Strategy',
        description: 'Switched from sporadic releases to consistent bi-weekly singles with coordinated promotion.',
      },
    ],
    
    // Timeline
    timeline: [
      { month: 'Month 1', event: 'Audience research & strategy development', metric: '523 → 892 listeners' },
      { month: 'Month 2', event: 'First Meta campaign launch', metric: '892 → 2,450 listeners' },
      { month: 'Month 3', event: 'Spotify editorial playlist placement', metric: '2,450 → 6,200 listeners' },
      { month: 'Month 4', event: 'Scale successful campaigns', metric: '6,200 → 10,847 listeners' },
    ],
    
    // Results
    keyResults: [
      'Achieved first Spotify editorial playlist placement (Ambient Relaxation)',
      'Built email list of 487 engaged fans from scratch',
      'Increased streaming revenue by 1,800%',
      'Created sustainable growth system continuing post-service',
    ],
    
    // Testimonial
    testimonial: {
      quote: "I finally understand how music marketing actually works. It's not about tricks or hacks - it's about finding your real audience and serving them consistently. The bi-weekly coaching sessions were like having a data scientist dedicated to my music career.",
      author: 'Luna Synthesis',
    },
  },
  
  'indie-band-tour-prep': {
    artistName: 'The Velvet Ghosts',
    genre: 'Indie Rock',
    serviceTier: 'Rising+',
    avatarUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop',
    startDate: 'February 2024',
    endDate: 'May 2024',
    
    metrics: {
      before: {
        monthlyListeners: 8420,
        streams: 31000,
        followers: 1250,
        engagementRate: '3.2%',
        emailSubscribers: 230,
        monthlyRevenue: '$124',
      },
      after: {
        monthlyListeners: 32150,
        streams: 142000,
        followers: 5670,
        engagementRate: '7.1%',
        emailSubscribers: 1850,
        monthlyRevenue: '$892',
      },
    },
    
    investment: {
      serviceFee: '$2,250', // 3 months @ $750
      adSpend: '$4,500',
      total: '$6,750',
    },
    
    challenge: `The Velvet Ghosts had a 15-date tour booked but minimal presence in most tour markets. They needed to build awareness and sell tickets in cities where they had fewer than 100 monthly listeners.`,
    
    strategy: [
      {
        title: 'Geo-Targeted Campaign Structure',
        description: 'Created separate campaigns for each tour market with 30-mile radius targeting.',
      },
      {
        title: 'Local Influencer Partnerships',
        description: 'Identified and partnered with micro-influencers in each tour city.',
      },
      {
        title: 'Content Calendar Alignment',
        description: 'Synchronized release schedule with tour dates for maximum impact.',
      },
      {
        title: 'Fan Activation Campaign',
        description: 'Built street team in key markets through exclusive content and early ticket access.',
      },
    ],
    
    timeline: [
      { month: 'Month 1', event: 'Market research & campaign setup', metric: '8,420 → 12,300 listeners' },
      { month: 'Month 2', event: 'Launch geo-targeted ads', metric: '12,300 → 21,450 listeners' },
      { month: 'Month 3', event: 'Tour promotion intensifies', metric: '21,450 → 32,150 listeners' },
      { month: 'Post-Tour', event: 'Sustaining momentum', metric: '32,150+ continuing growth' },
    ],
    
    keyResults: [
      '12 of 15 shows sold out (80% sellout rate vs. 20% previous tour)',
      'Average 380% increase in listeners across tour markets',
      'Built email lists in 6 key markets for future tours',
      'Generated $18K in ticket sales directly attributable to campaigns',
    ],
    
    testimonial: {
      quote: "We went from playing to half-empty rooms to sold-out venues. The market-specific approach was genius - we could see exactly which cities were responding and adjust our routing for next time.",
      author: 'Jake Morrison, The Velvet Ghosts',
    },
  },
  
  'singer-songwriter-fanbase': {
    artistName: 'Mara Chen',
    genre: 'Folk/Singer-Songwriter',
    serviceTier: 'Bedroom+',
    avatarUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
    startDate: 'November 2023',
    endDate: 'May 2024',
    
    metrics: {
      before: {
        monthlyListeners: 1205,
        streams: 4800,
        followers: 156,
        engagementRate: '1.8%',
        emailSubscribers: 0,
        monthlyRevenue: '$38',
      },
      after: {
        monthlyListeners: 5632,
        streams: 28900,
        followers: 1120,
        engagementRate: '8.2%',
        emailSubscribers: 2142,
        monthlyRevenue: '$485',
      },
    },
    
    investment: {
      serviceFee: '$1,200', // 6 months @ $200
      adSpend: '$800',
      total: '$2,000',
    },
    
    challenge: `Mara had beautiful, intimate songs but struggled to find her audience. Previous attempts at promotion felt inauthentic and didn't align with her values as an artist.`,
    
    strategy: [
      {
        title: 'Story-First Content Strategy',
        description: 'Developed content that shared the stories behind songs, connecting with fans on a deeper level.',
      },
      {
        title: 'Email List Building',
        description: 'Created free song downloads and exclusive acoustic versions to build direct fan relationships.',
      },
      {
        title: 'Micro-Budget Testing',
        description: 'Used $5-10/day campaigns to test different audiences and messages.',
      },
      {
        title: 'Community Building',
        description: 'Launched "Mara\'s Living Room" online community for superfans.',
      },
    ],
    
    timeline: [
      { month: 'Month 1-2', event: 'Foundation & list building', metric: '1,205 → 1,850 listeners' },
      { month: 'Month 3-4', event: 'Content strategy implementation', metric: '1,850 → 3,200 listeners' },
      { month: 'Month 5-6', event: 'Community launch & scaling', metric: '3,200 → 5,632 listeners' },
    ],
    
    keyResults: [
      'Built email list of 2,142 highly engaged fans',
      'Launched successful Patreon generating $300/month',
      'Increased streaming revenue by 1,176%',
      'Created sustainable fan-funded model beyond streaming',
    ],
    
    testimonial: {
      quote: "I learned that authentic marketing isn't an oxymoron. By sharing my real story and building genuine connections, I found my people. The email list has become my most valuable asset.",
      author: 'Mara Chen',
    },
  },
};

export async function generateStaticParams() {
  return getAllCaseStudyIds().map((id) => ({
    slug: id,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const study = getCaseStudyById(params.slug);
  
  if (!study) {
    return {
      title: 'Case Study Not Found',
    };
  }
  
  return {
    title: `${study.artistName} Case Study - ${study.metrics.before.monthlyListeners} to ${study.metrics.after.monthlyListeners} Monthly Listeners | Barely Sparrow`,
    description: `See how ${study.artistName} grew from ${study.metrics.before.monthlyListeners} to ${study.metrics.after.monthlyListeners} monthly listeners in ${study.timeline.length} months with ${study.serviceTier}.`,
  };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const study = getCaseStudyById(params.slug);
  
  if (!study) {
    notFound();
  }
  
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <Link href="/case-studies" className="inline-flex items-center text-purple-300 hover:text-purple-300 mb-12">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Case Studies
            </Link>
            
            {/* Spotify-style layout with large avatar and stacked info */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-8">
              {/* Large Avatar */}
              <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex-shrink-0 mx-auto md:mx-0">
                {study.avatarUrl ? (
                  <img 
                    src={study.avatarUrl} 
                    alt={study.artistName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl md:text-8xl font-bold text-white/60">
                    {study.artistName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Stacked Info */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm uppercase tracking-wide text-white/60 mb-2">Case Study</p>
                <H size="1" className="text-4xl md:text-6xl lg:text-7xl font-heading mb-4">
                  {study.artistName}
                </H>
                <div className="flex items-center gap-3 text-lg md:text-xl text-white/80 mb-2 justify-center md:justify-start">
                  <span>{study.genre} • {study.serviceTier}</span>
                  
                  {/* Social Links */}
                  {study.socials && (
                    <>
                      <span className="text-white/80">•</span>
                      <div className="flex gap-3 items-center">
                        {study.socials.spotify && (
                          <a
                            href={study.socials.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-green-500 transition-colors"
                            aria-label="Spotify"
                          >
                            <Icon.spotify className="w-4 h-4" />
                          </a>
                        )}
                        {study.socials.instagram && (
                          <a
                            href={study.socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-pink-500 transition-colors"
                            aria-label="Instagram"
                          >
                            <Icon.instagram className="w-4 h-4" />
                          </a>
                        )}
                        {study.socials.tiktok && (
                          <a
                            href={study.socials.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-white transition-colors"
                            aria-label="TikTok"
                          >
                            <Icon.tiktok className="w-4 h-4" />
                          </a>
                        )}
                        {study.socials.youtube && (
                          <a
                            href={study.socials.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-red-500 transition-colors"
                            aria-label="YouTube"
                          >
                            <Icon.youtube className="w-4 h-4" />
                          </a>
                        )}
                        {study.socials.patreon && (
                          <a
                            href={study.socials.patreon}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-orange-500 transition-colors"
                            aria-label="Patreon"
                          >
                            <Icon.heart className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-2xl md:text-3xl text-white">
                  <span className="text-white/60">{study.metrics.before.monthlyListeners.toLocaleString()}</span>
                  <span className="text-green-500 font-bold mx-3">→</span>
                  <span className="text-green-500 font-bold">{study.metrics.after.monthlyListeners.toLocaleString()}</span>
                  <span className="text-white/60 text-lg md:text-xl ml-2">monthly listeners</span>
                </p>
                <p className="text-white/60 mt-2">{study.startDate} - {study.endDate}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Metrics Dashboard */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection animation="fade-up">
            <CaseStudyMetrics before={study.metrics.before} after={study.metrics.after} />
          </AnimatedSection>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <H size="3" className="mb-6 text-3xl">The Challenge</H>
            <p className="text-lg text-white/80 leading-relaxed">
              {study.challenge}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Strategy Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <H size="3" className="mb-8 text-3xl">The Strategy</H>
          </AnimatedSection>
          
          <div className="space-y-6">
            {study.strategy.map((item, index) => (
              <AnimatedSection key={index} animation="slide-right" delay={200 + index * 100}>
                <div className="glass rounded-xl p-6">
                  <H size="5" className="mb-3 text-purple-300">{item.title}</H>
                  <p className="text-white/70">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <H size="3" className="mb-8 text-3xl">Campaign Timeline</H>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up" delay={200}>
            <CaseStudyTimeline timeline={study.timeline} />
          </AnimatedSection>
        </div>
      </section>

      {/* Investment & Return */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <H size="3" className="mb-8 text-3xl">Investment & Return</H>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedSection animation="scale" delay={200}>
              <div className="glass rounded-xl p-6 text-center">
                <p className="text-white/60 mb-2">Service Fee</p>
                <p className="text-2xl font-bold text-white">{study.investment.serviceFee}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="scale" delay={300}>
              <div className="glass rounded-xl p-6 text-center">
                <p className="text-white/60 mb-2">Ad Spend</p>
                <p className="text-2xl font-bold text-white">{study.investment.adSpend}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="scale" delay={400}>
              <div className="glass rounded-xl p-6 text-center border border-purple-500/30">
                <p className="text-white/60 mb-2">Total Investment</p>
                <p className="text-2xl font-bold text-purple-300">{study.investment.total}</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Key Results */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <H size="3" className="mb-8 text-3xl">Key Results</H>
          </AnimatedSection>
          
          <div className="space-y-4">
            {study.keyResults.map((result, index) => (
              <AnimatedSection key={index} animation="slide-right" delay={200 + index * 100}>
                <div className="flex items-start gap-4 glass rounded-xl p-4">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <p className="text-white/80">{result}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="scale">
            <div className="glass rounded-2xl p-8 text-center border border-purple-500/30">
              <svg className="w-12 h-12 text-purple-300 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl text-white/90 leading-relaxed mb-6 italic">
                "{study.testimonial.quote}"
              </p>
              <p className="text-white/60">— {study.testimonial.author}</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedSection animation="fade-up">
            <H size="2" className="mb-6 text-4xl md:text-5xl">
              Ready to Write Your Success Story?
            </H>
            <p className="text-xl text-white/70 mb-12">
              Every artist's journey is unique. Let's design a strategy that works for your music.
            </p>
          </AnimatedSection>
          
          <AnimatedSection animation="scale" delay={200}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/services">
                <MarketingButton marketingLook="hero-primary" size="lg">
                  View Services
                </MarketingButton>
              </Link>
              <Link href="/">
                <MarketingButton marketingLook="hero-secondary" size="lg">
                  Book Free Strategy Call
                </MarketingButton>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}