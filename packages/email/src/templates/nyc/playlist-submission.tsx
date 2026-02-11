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

export interface PlaylistSubmissionEmailProps {
	artistName: string;
	email: string;
	spotifyTrackUrl: string;
	instagramHandle: string;
	interestedInServices?: boolean;
}

export function PlaylistSubmissionEmail({
	artistName,
	email,
	spotifyTrackUrl,
	instagramHandle,
	interestedInServices = false,
}: PlaylistSubmissionEmailProps) {
	const previewText = `New @barely.indie playlist submission from ${artistName}`;

	// Remove @ symbol if present for URL construction
	const instagramUsername =
		instagramHandle.startsWith('@') ? instagramHandle.slice(1) : instagramHandle;
	const instagramUrl = `https://instagram.com/${instagramUsername}`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={styles.main}>
				<Container style={styles.container}>
					<Heading style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
						New @barely.indie Playlist Submission
					</Heading>

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
							<strong>Instagram:</strong>{' '}
							<Link href={instagramUrl} style={{ color: '#E1306C' }}>
								{instagramHandle}
							</Link>
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Submitted Track
						</Heading>
						<Text style={styles.resetText}>
							<Link href={spotifyTrackUrl} style={{ color: '#1DB954' }}>
								{spotifyTrackUrl}
							</Link>
						</Text>
					</Section>

					{interestedInServices && (
						<Section
							style={{
								marginBottom: '24px',
								padding: '16px',
								backgroundColor: '#f0f9ff',
								borderRadius: '8px',
								border: '2px solid #3b82f6',
							}}
						>
							<Heading
								as='h2'
								style={{
									fontSize: '18px',
									fontWeight: 'bold',
									marginBottom: '8px',
									color: '#1e40af',
								}}
							>
								🎯 Interested in Services
							</Heading>
							<Text style={{ ...styles.resetText, color: '#1e40af', fontWeight: '600' }}>
								This artist expressed interest in professional help with Spotify growth
								(playlist pitching, marketing strategy, analytics).
							</Text>
						</Section>
					)}

					<Section
						style={{
							marginTop: '32px',
							borderTop: '1px solid #e5e5e5',
							paddingTop: '24px',
						}}
					>
						<Text style={styles.mutedText}>
							This email was sent from the @barely.indie playlist submission form at
							barely.nyc/submit
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

PlaylistSubmissionEmail.PreviewProps = {
	artistName: 'The Example Band',
	email: 'artist@example.com',
	spotifyTrackUrl: 'https://open.spotify.com/track/1234567890abcdefghij',
	instagramHandle: '@theexampleband',
	interestedInServices: true,
} as PlaylistSubmissionEmailProps;

export default PlaylistSubmissionEmail;
