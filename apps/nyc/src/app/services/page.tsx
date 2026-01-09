import type { Metadata } from 'next';

import { ServicesContent } from './services-content';

export const metadata: Metadata = {
	title: 'Services - Music Marketing Engineers | Barely NYC',
	description:
		'Brooklyn-based music marketing engineers. Choose the service that fits your needs. From coaching to full campaign execution, all with data-driven transparency.',
};

export default function ServicesPage() {
	return <ServicesContent />;
}
