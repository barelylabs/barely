import { WORKSPACE_PLANS } from '@barely/const';

export function StructuredData() {
	// Get plus plans from constants
	const bedroomPlusPlan = WORKSPACE_PLANS.get('bedroom.plus');
	const risingPlusPlan = WORKSPACE_PLANS.get('rising.plus');
	const breakoutPlusPlan = WORKSPACE_PLANS.get('breakout.plus');

	const schema = {
		'@context': 'https://schema.org',
		'@type': 'ProfessionalService',
		'@id': 'https://barely.nyc',
		name: 'Barely NYC',
		alternateName: 'Barely',
		description: 'Brooklyn-based music marketing engineers helping independent artists worldwide with data-driven growth strategies.',
		url: 'https://barely.nyc',
		priceRange: '$$',
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Brooklyn',
			addressRegion: 'NY',
			addressCountry: 'US',
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: 40.6782,
			longitude: -73.9442,
		},
		areaServed: {
			'@type': 'GeoCircle',
			geoMidpoint: {
				'@type': 'GeoCoordinates',
				latitude: 40.6782,
				longitude: -73.9442,
			},
			geoRadius: '12500000', // Worldwide service
		},
		sameAs: [
			'https://barely.ai',
		],
		founder: {
			'@type': 'Person',
			name: 'Adam Barito',
			alumniOf: {
				'@type': 'EducationalOrganization',
				name: 'University of Michigan',
			},
			hasCredential: {
				'@type': 'EducationalOccupationalCredential',
				credentialCategory: 'PhD',
				educationalLevel: 'Doctoral degree',
				competencyRequired: 'Materials Science & Engineering',
			},
		},
		knowsAbout: [
			'Music Marketing',
			'Data Science',
			'Growth Engineering',
			'Independent Artists',
			'Digital Marketing',
			'Email Marketing',
			'Attribution Modeling',
			'Conversion Optimization',
			'Merchandise Sales',
		],
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Music Marketing Services',
			itemListElement: [
				bedroomPlusPlan && {
					'@type': 'Offer',
					name: bedroomPlusPlan.name,
					description: 'DIY coaching for artists with 0-10K monthly listeners',
					price: String(bedroomPlusPlan.price.monthly.amount),
					priceCurrency: 'USD',
					priceSpecification: {
						'@type': 'UnitPriceSpecification',
						price: String(bedroomPlusPlan.price.monthly.amount),
						priceCurrency: 'USD',
						unitText: 'MONTH',
					},
				},
				risingPlusPlan && {
					'@type': 'Offer',
					name: risingPlusPlan.name,
					description: 'Professional campaign execution for 10-50K monthly listeners',
					price: String(risingPlusPlan.price.monthly.amount),
					priceCurrency: 'USD',
					priceSpecification: {
						'@type': 'UnitPriceSpecification',
						price: String(risingPlusPlan.price.monthly.amount),
						priceCurrency: 'USD',
						unitText: 'MONTH',
					},
				},
				breakoutPlusPlan && {
					'@type': 'Offer',
					name: breakoutPlusPlan.name,
					description: 'Maximum growth engineering for 50K+ monthly listeners',
					price: String(breakoutPlusPlan.price.monthly.amount),
					priceCurrency: 'USD',
					priceSpecification: {
						'@type': 'UnitPriceSpecification',
						price: String(breakoutPlusPlan.price.monthly.amount),
						priceCurrency: 'USD',
						unitText: 'MONTH',
					},
				},
			].filter(Boolean),
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}