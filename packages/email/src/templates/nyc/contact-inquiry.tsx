import React from 'react';
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from '@react-email/components';

import * as styles from '../../styles';

export interface ContactInquiryEmailProps {
	name: string;
	email: string;
	artistName?: string;
	monthlyListeners?: string;
	service?: string;
	message: string;
	spotifyTrackUrl?: string;
	instagramHandle?: string;
	budgetRange?: string;
}

export function ContactInquiryEmail({
	name,
	email,
	artistName,
	monthlyListeners,
	service,
	message,
	spotifyTrackUrl,
	instagramHandle,
	budgetRange,
}: ContactInquiryEmailProps) {
	const previewText = `New contact inquiry from ${name}${service ? ` - ${service.charAt(0).toUpperCase() + service.slice(1)}+ Service` : ''}`;

	// Process Instagram handle for URL
	const instagramUsername =
		instagramHandle?.startsWith('@') ? instagramHandle.slice(1) : instagramHandle;
	const instagramUrl =
		instagramUsername ? `https://instagram.com/${instagramUsername}` : '';

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={styles.main}>
				<Container style={styles.container}>
					<Heading style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
						New Contact Form Submission
					</Heading>

					<Section style={{ marginBottom: '24px' }}>
						<Text style={styles.resetText}>
							<strong>Service Interest:</strong>{' '}
							{service ?
								`${service.charAt(0).toUpperCase() + service.slice(1)}+`
							:	'General Inquiry'}
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Contact Information
						</Heading>
						<Text style={styles.resetText}>
							<strong>Name:</strong> {name}
						</Text>
						<Text style={styles.resetText}>
							<strong>Email:</strong> {email}
						</Text>
						{artistName && (
							<Text style={styles.resetText}>
								<strong>Artist/Band Name:</strong> {artistName}
							</Text>
						)}
						{monthlyListeners && (
							<Text style={styles.resetText}>
								<strong>Monthly Listeners:</strong> {monthlyListeners}
							</Text>
						)}
						{instagramHandle && (
							<Text style={styles.resetText}>
								<strong>Instagram:</strong>{' '}
								<Link href={instagramUrl} style={{ color: '#E1306C' }}>
									{instagramHandle}
								</Link>
							</Text>
						)}
						{spotifyTrackUrl && (
							<Text style={styles.resetText}>
								<strong>Spotify Track:</strong>{' '}
								<Link href={spotifyTrackUrl} style={{ color: '#1DB954' }}>
									{spotifyTrackUrl}
								</Link>
							</Text>
						)}
						{budgetRange && (
							<Text style={styles.resetText}>
								<strong>Budget Range:</strong> {budgetRange}
							</Text>
						)}
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Message
						</Heading>
						<Text style={styles.resetText}>{message}</Text>
					</Section>

					<Section
						style={{
							marginTop: '32px',
							borderTop: '1px solid #e5e5e5',
							paddingTop: '24px',
						}}
					>
						<Text style={styles.mutedText}>
							This email was sent from the Barely NYC contact form.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

ContactInquiryEmail.PreviewProps = {
	name: 'John Doe',
	email: 'john@example.com',
	artistName: 'The Example Band',
	monthlyListeners: '5,000',
	service: 'rising',
	message:
		"I'm interested in learning more about your Rising+ service. My band has been growing steadily and we're ready to take things to the next level with professional campaign management.",
	spotifyTrackUrl: 'https://open.spotify.com/track/1234567890abcdefghij',
	instagramHandle: '@theexampleband',
	budgetRange: '$1k-2.5k',
} as ContactInquiryEmailProps;

export default ContactInquiryEmail;
