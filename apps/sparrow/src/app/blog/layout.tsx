import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Blog - Music Marketing Insights | Barely Sparrow',
    template: '%s | Barely Sparrow Blog',
  },
  description: 'Data-driven insights and strategies for independent artists navigating the modern music industry.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}