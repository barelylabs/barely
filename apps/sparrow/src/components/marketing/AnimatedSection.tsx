'use client';

import type { ReactNode } from 'react';
import { cn } from '@barely/lib/utils/cn';

import { useIntersection } from '../../hooks/useIntersection';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'scale' | 'slide-left' | 'slide-right';
  delay?: number;
  threshold?: number;
}

export function AnimatedSection({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, isIntersecting } = useIntersection({ threshold, triggerOnce: true });

  const animationClasses = {
    'fade-up': 'translate-y-10 opacity-0',
    'fade-in': 'opacity-0',
    'scale': 'scale-95 opacity-0',
    'slide-left': 'translate-x-10 opacity-0',
    'slide-right': '-translate-x-10 opacity-0',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-1000 ease-out',
        !isIntersecting && animationClasses[animation],
        isIntersecting && 'translate-x-0 translate-y-0 scale-100 opacity-100',
        className
      )}
      style={{
        transitionDelay: isIntersecting ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
}