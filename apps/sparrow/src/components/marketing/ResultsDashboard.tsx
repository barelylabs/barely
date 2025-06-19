'use client';

import { useEffect, useState } from 'react';
import { cn } from '@barely/lib/utils/cn';
import { Icon } from '@barely/ui/elements/icon';
import { H } from '@barely/ui/elements/typography';

interface ServiceTierMetrics {
  name: string;
  avgGrowth: number;
  successRate: number;
  totalClients: number;
  color: string;
}

const serviceMetrics: ServiceTierMetrics[] = [
  {
    name: 'Bedroom+',
    avgGrowth: 425,
    successRate: 92,
    totalClients: 234,
    color: 'from-purple-500 to-purple-600',
  },
  {
    name: 'Rising+',
    avgGrowth: 847,
    successRate: 96,
    totalClients: 189,
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Breakout+',
    avgGrowth: 1250,
    successRate: 98,
    totalClients: 64,
    color: 'from-pink-500 to-pink-600',
  },
];

const genreDistribution = [
  { genre: 'Hip-Hop', percentage: 28, count: 136 },
  { genre: 'Electronic', percentage: 22, count: 107 },
  { genre: 'Indie Rock', percentage: 18, count: 88 },
  { genre: 'Pop', percentage: 15, count: 73 },
  { genre: 'Folk/Singer-Songwriter', percentage: 12, count: 58 },
  { genre: 'Other', percentage: 5, count: 25 },
];

export function ResultsDashboard() {
  const [animatedValue, setAnimatedValue] = useState(0);
  const targetValue = 2347892; // Total streams generated

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const increment = targetValue / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setAnimatedValue(targetValue);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetValue]);

  return (
    <div className="glass rounded-2xl p-8">
      <H size="3" className="text-center mb-8 text-3xl">
        Transparent Results Across All Clients
      </H>

      {/* Total Streams Counter */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon.playCircle className="w-6 h-6 text-green-500" />
          <p className="text-white/60">Total Streams Generated</p>
        </div>
        <p className="text-5xl md:text-6xl font-bold text-green-500">
          {animatedValue.toLocaleString()}+
        </p>
      </div>

      {/* Service Tier Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {serviceMetrics.map((tier, index) => (
          <div
            key={tier.name}
            className="p-6 rounded-xl bg-white/5 border border-white/10"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h4 className="font-semibold text-white mb-4">{tier.name}</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon.rocket className="w-4 h-4 text-purple-500" />
                  <p className="text-sm text-white/60">Avg Growth</p>
                </div>
                <p className="text-2xl font-bold text-white">+{tier.avgGrowth}%</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon.target className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-white/60">Success Rate</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full bg-gradient-to-r rounded-full', tier.color)}
                      style={{ width: `${tier.successRate}%` }}
                    />
                  </div>
                  <span className="text-sm text-white">{tier.successRate}%</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon.users className="w-4 h-4 text-blue-500" />
                  <p className="text-sm text-white/60">Total Clients</p>
                </div>
                <p className="text-lg text-white">{tier.totalClients}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Genre Distribution */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Icon.music className="w-5 h-5 text-purple-500" />
          <h4 className="font-semibold text-white">Success Across All Genres</h4>
        </div>
        <div className="space-y-3">
          {genreDistribution.map((genre, index) => (
            <div key={genre.genre} className="flex items-center gap-4">
              <div className="w-32 text-sm text-white/60">{genre.genre}</div>
              <div className="flex-1">
                <div className="h-6 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-end pr-2"
                    style={{ 
                      width: `${genre.percentage}%`,
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <span className="text-xs text-white font-medium">{genre.count}</span>
                  </div>
                </div>
              </div>
              <div className="w-12 text-right text-sm text-white/60">{genre.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-white/40 text-center mt-8">
        * Results vary by artist, genre, and market conditions. These figures represent averages across all clients from 2023-2024.
      </p>
    </div>
  );
}