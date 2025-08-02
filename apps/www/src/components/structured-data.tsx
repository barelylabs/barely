export function StructuredData() {
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		'@id': 'https://barely.ai',
		name: 'barely.ai',
		alternateName: 'Barely Platform',
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		description: 'Open-source marketing platform for indie artists. Smart links, email marketing, landing pages, merch sales, and unified analytics.',
		url: 'https://barely.ai',
		author: {
			'@type': 'Organization',
			name: 'Barely',
			url: 'https://barely.nyc',
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'Brooklyn',
				addressRegion: 'NY',
				addressCountry: 'US',
			},
			sameAs: [
				'https://github.com/barelylabs/barely',
			],
		},
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
			description: 'Free tier available with paid upgrades',
		},
		aggregateRating: {
			'@type': 'AggregateRating',
			ratingValue: '5',
			ratingCount: '5000',
		},
		featureList: [
			'Smart Links',
			'Email Marketing',
			'Landing Pages',
			'Merchandise Sales',
			'Flow Automation',
			'Analytics Dashboard',
			'Cart & Checkout',
			'Fan CRM',
		],
		screenshot: 'https://barely.ai/_static/screenshots/app.png',
		softwareVersion: '1.0',
		isAccessibleForFree: true,
		license: 'https://github.com/barelylabs/barely/blob/main/LICENSE',
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}