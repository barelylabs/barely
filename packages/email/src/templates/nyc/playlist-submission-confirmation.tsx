import React from 'react';
import {
	Body,
	Button,
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

export interface PlaylistSubmissionConfirmationEmailProps {
	artistName: string;
}

export function PlaylistSubmissionConfirmationEmail({
	artistName,
}: PlaylistSubmissionConfirmationEmailProps) {
	const previewText = `Thanks for submitting to @barely.indie, ${artistName}!`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={styles.main}>
				<Container style={styles.container}>
					<Heading style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
						Submission Received! 🎵
					</Heading>

					<Text style={{ ...styles.resetText, marginBottom: '16px' }}>
						Hey {artistName},
					</Text>

					<Text style={{ ...styles.resetText, marginBottom: '24px' }}>
						Thanks for submitting your track to the @barely.indie playlist! We'll listen
						to your submission and get back to you within 1-2 weeks.
					</Text>

					<Section
						style={{
							marginBottom: '32px',
							padding: '20px',
							backgroundColor: '#f7f7f7',
							borderRadius: '8px',
						}}
					>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}
						>
							While you wait...
						</Heading>

						<Text style={{ ...styles.resetText, marginBottom: '12px' }}>
							📱{' '}
							<Link
								href='https://www.instagram.com/barely.indie/'
								style={{ color: '#E1306C' }}
							>
								Follow @barely.indie on Instagram
							</Link>{' '}
							to stay updated on new playlist additions
						</Text>

						<Text style={{ ...styles.resetText, marginBottom: '16px' }}>
							🎧{' '}
							<Link
								href='https://open.spotify.com/user/utp4m7qc09m6p72s0ztqvajdu?si=8de3eadb478a44d3'
								style={{ color: '#1DB954' }}
							>
								Follow the playlist on Spotify
							</Link>{' '}
							to get notified when tracks are added
						</Text>

						<div style={{ textAlign: 'center', marginTop: '24px' }}>
							<Button
								href='https://barely.nyc/case-studies'
								style={{
									backgroundColor: '#000000',
									color: '#ffffff',
									padding: '12px 24px',
									borderRadius: '6px',
									textDecoration: 'none',
									display: 'inline-block',
									fontWeight: 'bold',
								}}
							>
								See Artist Success Stories
							</Button>
						</div>
					</Section>

					<Section>
						<Text style={{ ...styles.resetText, marginBottom: '12px' }}>
							<strong>What happens next?</strong>
						</Text>
						<Text style={{ ...styles.resetText, marginBottom: '8px' }}>
							✓ We'll review your track within 1-2 weeks
						</Text>
						<Text style={{ ...styles.resetText, marginBottom: '8px' }}>
							✓ You'll receive an email with our decision
						</Text>
						<Text style={{ ...styles.resetText, marginBottom: '24px' }}>
							✓ If accepted, your track will be added to the playlist
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
							Questions? Reply to this email or reach out on Instagram @barely.indie
						</Text>
						<Text style={{ ...styles.mutedText, marginTop: '8px' }}>
							barely.nyc • Brooklyn-based indie music community
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

PlaylistSubmissionConfirmationEmail.PreviewProps = {
	artistName: 'The Example Band',
} as PlaylistSubmissionConfirmationEmailProps;

export default PlaylistSubmissionConfirmationEmail;
