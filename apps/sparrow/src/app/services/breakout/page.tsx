import type { Metadata } from 'next';
import Link from 'next/link';
import { H } from '@barely/ui/elements/typography';

import { AnimatedSection } from '../../../components/marketing/AnimatedSection';
import { MarketingButton } from '../../../components/marketing/Button';
import { PricingCard } from '../../../components/marketing/PricingCard';

export const metadata: Metadata = {
  title: 'Breakout+ Service - Maximum Growth Engineering | Barely Sparrow',
  description: 'Perfect for artists with 50K+ monthly listeners ready to scale aggressively. Full campaign execution + content optimization + complete revenue strategy.',
};

export default function BreakoutPlusPage() {
  return (
    <main className="pt-16">
      {/* Page Header */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedSection animation="fade-up">
            <div className="mb-4">
              <span className="text-purple-300 text-xl md:text-2xl font-semibold">$1,800/month</span>
            </div>
            <H size="1" className="text-5xl md:text-6xl lg:text-7xl font-heading mb-6 gradient-text">
              Breakout+
            </H>
            <p className="text-2xl md:text-3xl text-white mb-4">
              Maximum Growth Engineering
            </p>
            <p className="text-lg text-white/70">
              Perfect for artists with 50K+ monthly listeners • Scale aggressively with full transparency
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <div className="glass rounded-2xl p-8 mb-12 border border-purple-500/30 shadow-[0_0_60px_rgba(168,85,247,0.3)]">
              <H size="3" className="mb-6 text-2xl md:text-3xl">
                You've Proven Your Music Works. Now Let's Engineer Your Breakthrough.
              </H>
              <p className="text-lg text-white/80 leading-relaxed mb-4">
                You've built a solid fanbase and consistent streaming numbers. You're ready 
                to invest serious resources into scaling to the next level - but you want 
                every dollar working efficiently with complete transparency into the process.
              </p>
              <p className="text-xl text-white font-semibold">
                Breakout+ is maximum growth engineering for artists ready to dominate their genre.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection animation="fade-up">
            <H size="2" className="text-center mb-12 text-3xl md:text-4xl">
              What You Get
            </H>
          </AnimatedSection>

          <div className="space-y-8">
            <AnimatedSection animation="fade-up" delay={200}>
              <div className="glass rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <H size="5" className="mb-2">Up to 2 Advanced Campaigns Per Month with Full Execution</H>
                    <p className="text-white/70">
                      Complete campaign design, technical implementation, and optimization. We handle 
                      everything from audience research to ad creative to landing page optimization. 
                      You focus on creating.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <div className="glass rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">💰</span>
                  <div>
                    <H size="5" className="mb-2">Expert Management of Up to $6,000 Monthly Ad Spend</H>
                    <p className="text-white/70">
                      Your $3-6K monthly budget optimized across platforms with advanced attribution 
                      modeling, audience segmentation, and real-time campaign adjustment. Maximum 
                      efficiency, zero waste.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={400}>
              <div className="glass rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🛒</span>
                  <div>
                    <H size="5" className="mb-2">Complete Merch Revenue Optimization</H>
                    <p className="text-white/70">
                      Full strategy, platform management, and campaign integration. We engineer 
                      your entire funnel from discovery to purchase, maximizing both streaming 
                      and physical sales with 50-90% immediate returns.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={500}>
              <div className="glass rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📅</span>
                  <div>
                    <H size="5" className="mb-2">Content Scheduling + Timing Optimization</H>
                    <p className="text-white/70">
                      You create the content, we optimize when and how it gets released for 
                      maximum algorithmic impact. Strategic timing across platforms based on 
                      your audience data and engagement patterns.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={600}>
              <div className="glass rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🛠️</span>
                  <div>
                    <H size="5" className="mb-2">Full Access to barely.io Tools (Breakout Tier Included)</H>
                    <p className="text-white/70">
                      Premium analytics, advanced automation, A/B testing capabilities, and 
                      priority technical support. Everything at the enterprise level, included free.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={700}>
              <div className="glass rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📊</span>
                  <div>
                    <H size="5" className="mb-2">Bi-Weekly Strategy Sessions with Advanced Analytics</H>
                    <p className="text-white/70">
                      30-minute deep dives into performance data, audience insights, and growth 
                      optimization. You'll understand not just what's working, but how to 
                      replicate and scale it.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={800}>
              <div className="glass rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <H size="5" className="mb-2">Priority Support + Rapid Campaign Adjustments</H>
                    <p className="text-white/70">
                      Direct access for urgent optimizations, algorithm updates, or time-sensitive 
                      opportunities. When you need to move fast, we're ready.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <H size="2" className="text-center mb-12 text-3xl md:text-4xl">
              The Process: Full Growth Engineering
            </H>
          </AnimatedSection>

          <div className="space-y-6">
            <AnimatedSection animation="slide-right" delay={200}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-40 font-bold text-purple-300">Deep Analysis:</div>
                <p className="text-white/80">
                  Comprehensive audit of your current performance, audience data, and growth opportunities
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slide-right" delay={300}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-40 font-bold text-purple-300">Strategic Planning:</div>
                <p className="text-white/80">
                  Custom growth roadmap with specific milestones and optimization targets
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slide-right" delay={400}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-40 font-bold text-purple-300">Full Execution:</div>
                <p className="text-white/80">
                  Complete campaign management while you focus on content creation and fan engagement
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slide-right" delay={500}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-40 font-bold text-purple-300">Continuous Optimization:</div>
                <p className="text-white/80">
                  Daily monitoring and adjustment based on performance data and market changes
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slide-right" delay={600}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-40 font-bold text-purple-300">Revenue Maximization:</div>
                <p className="text-white/80">
                  Integrated streaming and merch strategies for both discovery and monetization
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <H size="2" className="text-center mb-12 text-3xl md:text-4xl">
              Perfect For:
            </H>
          </AnimatedSection>

          <div className="space-y-4">
            {[
              'Established artists (50K+ monthly listeners) ready for aggressive scaling',
              'Musicians with $3-6K monthly marketing budgets who want maximum ROI',
              'Artists who want complete professional execution with full transparency',
              'Bands preparing for major releases, tours, or label negotiations',
              'Musicians ready to treat their art like a serious business',
            ].map((item, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={200 + index * 100}>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <p className="text-white/80 text-lg">{item}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Breakout+ Different */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <H size="2" className="text-center mb-12 text-3xl md:text-4xl">
              What Makes Breakout+ Different
            </H>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <p className="text-lg text-white/80 mb-8 text-center">
              Unlike premium agencies that charge similar rates while keeping you in the dark:
            </p>
          </AnimatedSection>

          <div className="space-y-4">
            {[
              'Complete transparency about every strategy, decision, and dollar spent',
              'Open-source platform means you can see exactly how campaigns operate',
              'Focus on both streaming growth AND revenue optimization',
              'Bi-weekly education so you understand the methodology',
              'No fake playlist placements or algorithm violations',
            ].map((item, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={300 + index * 100}>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✅</span>
                  <p className="text-white/80 text-lg">{item}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection animation="fade-up">
            <H size="2" className="text-center mb-12 text-3xl md:text-4xl">
              Recent Breakout+ Results
            </H>
          </AnimatedSection>

          <div className="space-y-8">
            <AnimatedSection animation="fade-up" delay={200}>
              <blockquote className="glass rounded-xl p-6 border border-purple-500/20">
                <p className="text-lg text-white/90 mb-4 italic">
                  "In 6 months we went from 45K to 120K monthly listeners while tripling our 
                  merch revenue. [Your name] doesn't just grow streams - he builds sustainable 
                  music businesses."
                </p>
                <cite className="text-white/70">- [Client Band], Alt Rock</cite>
              </blockquote>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <blockquote className="glass rounded-xl p-6 border border-purple-500/20">
                <p className="text-lg text-white/90 mb-4 italic">
                  "Finally, an agency that shows me exactly where every dollar goes and why. 
                  Our cost per fan acquisition dropped 60% while our lifetime value doubled."
                </p>
                <cite className="text-white/70">- [Client Name], Indie Rock</cite>
              </blockquote>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <AnimatedSection animation="scale">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-2xl blur-lg opacity-75 animate-glow-pulse" />
              <PricingCard
                title="Breakout+"
                price="$1,800"
                description="Maximum growth engineering for serious artists"
                features={[
                  'Up to 2 advanced campaigns with full execution',
                  'Management of $3-6K monthly ad spend',
                  'Full access to barely.io tools (Breakout tier)',
                  'Bi-weekly strategy sessions with analytics',
                  'Complete merch revenue optimization',
                  'Content scheduling + timing optimization',
                  'Priority support + rapid adjustments',
                ]}
                ctaText="Start Breakout+ Today"
                featured
                className="relative"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <div className="text-center mt-8">
              <p className="text-white/60 mb-4">Compare our services:</p>
              <div className="flex gap-4 justify-center">
                <Link href="/services">
                  <MarketingButton marketingLook="glass" size="sm">
                    View All Services
                  </MarketingButton>
                </Link>
                <a href="mailto:hello@barelysparrow.com">
                  <MarketingButton marketingLook="scientific" size="sm">
                    Book Strategy Call
                  </MarketingButton>
                </a>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={300}>
            <p className="text-center text-white/60 mt-12 text-sm">
              Ready to discuss your specific growth goals? <a href="mailto:hello@barelysparrow.com" className="text-purple-300 hover:text-purple-300 underline">Email me directly</a> - no sales team, 
              just the scientist who'll engineer your campaigns.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Price Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection animation="fade-up">
            <H size="3" className="text-center mb-8 text-2xl md:text-3xl">
              Compare All Services
            </H>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bedroom+ - Muted */}
              <div className="opacity-60">
                <Link href="/services/bedroom">
                  <PricingCard
                    title="Bedroom+"
                    price="$200"
                    description="Learn the scientific method"
                    features={[
                      'Bi-weekly 30-min coaching',
                      'barely.io tools (Bedroom tier)',
                      'Campaign blueprints',
                      'Merch platform + strategy',
                      'Direct email support',
                    ]}
                    ctaText="Learn More →"
                  />
                </Link>
              </div>
              
              {/* Rising+ - Muted */}
              <div className="opacity-60">
                <Link href="/services/rising">
                  <PricingCard
                    title="Rising+"
                    price="$750"
                    description="Professional execution"
                    features={[
                      'Up to 2 campaigns/month',
                      '$1-3K ad spend management',
                      'barely.io tools (Rising tier)',
                      'Monthly strategy calls',
                      'Revenue optimization',
                    ]}
                    ctaText="Learn More →"
                  />
                </Link>
              </div>
              
              {/* Breakout+ - Featured */}
              <PricingCard
                title="Breakout+"
                price="$1,800"
                description="Maximum growth engineering"
                features={[
                  'Advanced campaign execution',
                  '$3-6K ad spend management',
                  'barely.io tools (Breakout tier)',
                  'Bi-weekly deep dives',
                  'Priority support',
                ]}
                ctaText="Currently Selected"
                featured
              />
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}