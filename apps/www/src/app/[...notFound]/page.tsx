import { notFound } from 'next/navigation';

export default function NotFoundPage() {
	notFound();
	return <div className='min-h-full'></div>;
}
