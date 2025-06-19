'use client';

import { useEffect, useState } from 'react';
import { cn } from '@barely/lib/utils/cn';

import { useCountUp } from '../../hooks/useCountUp';
import { useIntersection } from '../../hooks/useIntersection';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  showValues?: boolean;
  animate?: boolean;
  className?: string;
}

export function BarChart({ 
  data, 
  maxValue, 
  showValues = true, 
  animate = true,
  className 
}: BarChartProps) {
  const { ref, isIntersecting } = useIntersection({ threshold: 0.1 });
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (isIntersecting && animate && !isAnimated) {
      setIsAnimated(true);
    }
  }, [isIntersecting, animate, isAnimated]);

  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div ref={ref} className={cn('space-y-4', className)}>
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-white/70">{item.label}</span>
            {showValues && (
              <span className="text-sm font-semibold text-white">
                {item.value.toLocaleString()}
              </span>
            )}
          </div>
          <div className="relative h-8 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out',
                item.color || 'bg-gradient-to-r from-violet-600 to-pink-600'
              )}
              style={{
                width: isAnimated ? `${(item.value / max) * 100}%` : '0%',
                transitionDelay: `${index * 100}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color?: string;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  suffix = '', 
  prefix = '',
  color = 'text-white',
  className 
}: StatCardProps) {
  const { ref, isIntersecting } = useIntersection({ threshold: 0.1 });
  const { formattedCount, start } = useCountUp({
    end: value,
    duration: 2000,
    suffix,
    prefix,
  });

  useEffect(() => {
    if (isIntersecting) {
      start();
    }
  }, [isIntersecting, start]);

  return (
    <div ref={ref} className={cn('glass rounded-xl p-6 text-center', className)}>
      <p className="text-white/70 text-sm mb-2">{label}</p>
      <p className={cn('text-4xl font-bold', color)}>
        {formattedCount}
      </p>
    </div>
  );
}

interface GrowthChartProps {
  data: { month: string; value: number }[];
  height?: number;
  className?: string;
}

export function GrowthChart({ data, height = 200, className }: GrowthChartProps) {
  const { ref, isIntersecting } = useIntersection({ threshold: 0.1 });
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (isIntersecting && !isAnimated) {
      setIsAnimated(true);
    }
  }, [isIntersecting, isAnimated]);

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div ref={ref} className={cn('relative', className)} style={{ height }}>
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="border-t border-white/5" />
        ))}
      </div>

      {/* Chart */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="growth-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area */}
        <path
          d={`
            M 0 ${height}
            ${data.map((point, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = height - ((point.value - minValue) / range) * height * 0.8 - height * 0.1;
              return `L ${x}% ${isAnimated ? y : height}`;
            }).join(' ')}
            L 100% ${height}
            Z
          `}
          fill="url(#growth-gradient)"
          className="transition-all duration-1000 ease-out"
        />

        {/* Line */}
        <path
          d={`
            M 0 ${height - (((data[0]?.value ?? 0) - minValue) / range) * height * 0.8 - height * 0.1}
            ${data.slice(1).map((point, i) => {
              const x = ((i + 1) / (data.length - 1)) * 100;
              const y = height - ((point.value - minValue) / range) * height * 0.8 - height * 0.1;
              return `L ${x}% ${isAnimated ? y : height}`;
            }).join(' ')}
          `}
          fill="none"
          stroke="rgb(168, 85, 247)"
          strokeWidth="2"
          className="transition-all duration-1000 ease-out"
        />

        {/* Dots */}
        {data.map((point, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = height - ((point.value - minValue) / range) * height * 0.8 - height * 0.1;
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={isAnimated ? y : height}
              r="4"
              fill="rgb(168, 85, 247)"
              className="transition-all duration-1000 ease-out"
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/50 mt-2">
        {data.filter((_, i) => i % Math.ceil(data.length / 4) === 0).map((point, i) => (
          <span key={i}>{point.month}</span>
        ))}
      </div>
    </div>
  );
}