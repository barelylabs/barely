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

export interface PlaylistQualifierEmailProps {
	artistName: string;
	email: string;
	spotifyTrackUrl: string;
	instagramHandle: string;
	budgetRange: string;
	goals: string;
}

export function PlaylistQualifierEmail({
	artistName,
	email,
	spotifyTrackUrl,
	instagramHandle,
	budgetRange,
	goals,
}: PlaylistQualifierEmailProps) {
	const previewText = `Service inquiry from ${artistName} - ${budgetRange}`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={styles.main}>
				<Container style={styles.container}>
					<Heading style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
						Qualified Lead: Service Inquiry
					</Heading>

					<Section
						style={{
							marginBottom: '24px',
							padding: '16px',
							backgroundColor: '#f0fdf4',
							borderRadius: '8px',
							border: '1px solid #86efac',
						}}
					>
						<Text
							style={{
								...styles.resetText,
								color: '#16a34a',
								fontWeight: 'bold',
								fontSize: '14px',
							}}
						>
							🎯 High-Intent Lead - Artist interested in services
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Artist Information
						</Heading>
						<Text style={styles.resetText}>
							<strong>Artist Name:</strong> {artistName}
						</Text>
						<Text style={styles.resetText}>
							<strong>Email:</strong> {email}
						</Text>
						<Text style={styles.resetText}>
							<strong>Instagram:</strong> {instagramHandle}
						</Text>
						<Text style={styles.resetText}>
							<strong>Track:</strong>{' '}
							<Link href={spotifyTrackUrl} style={{ color: '#1DB954' }}>
								Spotify Link
							</Link>
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Service Interest
						</Heading>
						<Text style={styles.resetText}>
							<strong>Budget Range:</strong> {budgetRange}
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Goals
						</Heading>
						<Text style={styles.resetText}>{goals}</Text>
					</Section>

					<Section
						style={{
							marginTop: '32px',
							borderTop: '1px solid #e5e5e5',
							paddingTop: '24px',
						}}
					>
						<Text style={styles.mutedText}>
							This email was sent from the playlist qualifier form at
							barely.nyc/submit-to-barely-indie/qualifier
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

PlaylistQualifierEmail.PreviewProps = {
	artistName: 'The Example Band',
	email: 'artist@example.com',
	spotifyTrackUrl: 'https://open.spotify.com/track/1234567890abcdefghij',
	instagramHandle: '@theexampleband',
	budgetRange: '$1k-2.5k',
	goals:
		"We've been growing steadily and want to scale our audience reach with professional campaign management. Looking to go from 5k to 25k monthly listeners in the next 6 months.",
} as PlaylistQualifierEmailProps;

export default PlaylistQualifierEmail;
