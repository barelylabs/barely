'use client';

import { cn } from '@barely/lib/utils/cn';
import { H } from '@barely/ui/elements/typography';

import { MarketingButton } from './Button';

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice?: string;
  period?: string;
  description: string;
  features: string[];
  ctaText?: string;
  featured?: boolean;
  className?: string;
  spotsLeft?: number;
  onCTAClick?: () => void;
}

export function PricingCard({
  title,
  price,
  originalPrice,
  period = '/month',
  description,
  features,
  ctaText = 'Get Started',
  featured = false,
  className,
  spotsLeft,
  onCTAClick,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-8',
        'glass border',
        featured ? 'border-purple-500/50' : 'border-white/10',
        'transition-all duration-150',
        'hover:scale-105',
        featured && 'shadow-[0_0_60px_rgba(168,85,247,0.4)]',
        className
      )}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {spotsLeft !== undefined && (
        <div className="absolute -top-4 right-4">
          <span className={cn(
            "text-xs font-medium px-3 py-1 rounded-full",
            spotsLeft <= 2 ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500"
          )}>
            {spotsLeft} spots left
          </span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <H size="4" className="mb-2 text-white">
            {title}
          </H>
          <p className="text-white/70">{description}</p>
        </div>

        <div className="space-y-1">
          {originalPrice && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-300 font-medium">First Month Special</span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            {originalPrice && (
              <span className="text-2xl text-white/40 line-through">{originalPrice}</span>
            )}
            <span className="text-4xl font-bold text-white">{price}</span>
            <span className="text-white/70">{period}</span>
          </div>
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span className="text-white/80 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <MarketingButton
          marketingLook={featured ? 'hero-primary' : 'glass'}
          size="lg"
          fullWidth
          onClick={onCTAClick}
        >
          {ctaText}
        </MarketingButton>
      </div>
    </div>
  );
}