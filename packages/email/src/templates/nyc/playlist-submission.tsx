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
}

export function PlaylistSubmissionEmail({
	artistName,
	email,
	spotifyTrackUrl,
	instagramHandle,
}: PlaylistSubmissionEmailProps) {
	const previewText = `New @barely.indie playlist submission from ${artistName}`;

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
							<strong>Instagram:</strong> {instagramHandle}
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
} as PlaylistSubmissionEmailProps;

export default PlaylistSubmissionEmail;
