'use client';

import { cn } from '@barely/lib/utils/cn';
import { Icon } from '@barely/ui/elements/icon';
import { H } from '@barely/ui/elements/typography';

interface CaseStudyCardProps {
  artistName: string;
  genre: string;
  serviceTier: string;
  beforeListeners: number;
  afterListeners: number;
  growthPercentage: number;
  timeframe: string;
  summary: string;
  avatarUrl?: string;
  merchRevenue?: {
    before: number;
    after: number;
  };
  featured?: boolean;
}

export function CaseStudyCard({
  artistName,
  genre,
  serviceTier,
  beforeListeners,
  afterListeners,
  growthPercentage,
  timeframe,
  summary,
  avatarUrl,
  merchRevenue,
  featured = false,
}: CaseStudyCardProps) {
  const tierColors = {
    'Bedroom+': 'text-purple-300 border-purple-500/30',
    'Rising+': 'text-blue-300 border-blue-500/30',
    'Breakout+': 'text-pink-300 border-pink-500/30',
  };

  return (
    <div
      className={cn(
        'group h-full flex flex-col',
        'glass rounded-2xl p-6 sm:p-8',
        'border transition-all duration-300',
        featured ? 'border-purple-500/30' : 'border-white/10',
        'hover:scale-105 hover:border-purple-500/50',
        featured && 'shadow-[0_0_40px_rgba(168,85,247,0.3)]'
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className={cn(
            'text-sm font-medium px-3 py-1 rounded-full border',
            tierColors[serviceTier as keyof typeof tierColors] || 'text-white/60 border-white/20'
          )}>
            {serviceTier}
          </span>
          <span className="text-sm text-white/60">{timeframe}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex-shrink-0">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={artistName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/60">
                {artistName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Artist Info */}
          <div className="flex-1">
            <H size="4" className="mb-1 text-white group-hover:text-purple-300 transition-colors">
              {artistName}
            </H>
            <p className="text-white/60 text-sm">{genre}</p>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="mb-6 space-y-4">
        {/* Spotify Monthly Listeners */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon.spotify className="w-4 h-4 text-green-500" />
            <p className="text-xs text-white/60">Spotify Monthly Listeners</p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-white/40 mb-1">Before</p>
              <p className="text-lg text-white/70">{beforeListeners.toLocaleString()}</p>
            </div>
            
            <div className="flex-shrink-0 text-center">
              <p className="text-xs text-white/60 mb-1">{timeframe}</p>
              <p className="text-2xl font-bold text-green-500">+{growthPercentage}%</p>
            </div>
            
            <div className="flex-1 text-right">
              <p className="text-xs text-white/40 mb-1">After</p>
              <p className="text-lg text-white font-semibold">{afterListeners.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(growthPercentage / 10, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Merch Revenue if applicable */}
        {merchRevenue && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon.cashRegister className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-white/60">Monthly Merch Revenue</p>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-white/40 mb-1">Before</p>
                <p className="text-lg text-white/70">${merchRevenue.before.toLocaleString()}</p>
              </div>
              
              <div className="flex-shrink-0 text-center">
                <p className="text-xl font-bold text-yellow-500">
                  {merchRevenue.before === 0 
                    ? `New Revenue!` 
                    : `+${Math.round(((merchRevenue.after - merchRevenue.before) / merchRevenue.before) * 100).toLocaleString()}%`
                  }
                </p>
              </div>
              
              <div className="flex-1 text-right">
                <p className="text-xs text-white/40 mb-1">After</p>
                <p className="text-lg text-white font-semibold">${merchRevenue.after.toLocaleString()}/mo</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <p className="text-white/70 text-sm leading-relaxed mb-6 flex-grow">
        {summary}
      </p>

      {/* CTA */}
      <div className="flex items-center text-purple-300 group-hover:text-purple-300 transition-colors">
        <span className="text-sm font-medium">Read Full Case Study</span>
        <svg
          className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
}