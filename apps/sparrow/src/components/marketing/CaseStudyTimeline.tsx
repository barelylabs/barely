'use client';

interface TimelineItem {
  month: string;
  event: string;
  metric: string;
}

interface CaseStudyTimelineProps {
  timeline: TimelineItem[];
}

export function CaseStudyTimeline({ timeline }: CaseStudyTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500" />
      
      <div className="space-y-8">
        {timeline.map((item, index) => (
          <div key={index} className="relative flex items-start gap-6">
            {/* Dot */}
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-[#0A0A0B] border-2 border-purple-500">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
            </div>
            
            {/* Content */}
            <div className="flex-1 glass rounded-xl p-6">
              <p className="text-sm text-purple-300 font-medium mb-2">{item.month}</p>
              <p className="text-lg text-white mb-3">{item.event}</p>
              <p className="text-sm text-green-500 font-semibold">{item.metric}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}