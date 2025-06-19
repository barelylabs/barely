'use client';

import type { ReactNode } from 'react';
import { cn } from '@barely/lib/utils/cn';
import { H } from '@barely/ui/elements/typography';

interface ValueCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function ValueCard({ icon, title, description, className }: ValueCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-8',
        'glass border border-white/10',
        'transition-all duration-150',
        'hover:scale-105',
        'hover:border-purple-500/30',
        'glow-card-purple',
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at center, rgba(168,85,247,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-6 inline-flex p-3 rounded-xl bg-purple-500/10 text-purple-400">
          {icon}
        </div>
        
        <H size="5" className="mb-4 text-white">
          {title}
        </H>
        
        <p className="text-white/70 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}