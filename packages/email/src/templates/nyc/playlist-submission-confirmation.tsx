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

export interface PlaylistSubmissionConfirmationEmailProps {
	artistName: string;
}

export function PlaylistSubmissionConfirmationEmail({
	artistName,
}: PlaylistSubmissionConfirmationEmailProps) {
	const previewText = `Your @barely.indie submission is in! Here's what happens next...`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={styles.main}>
				<Container style={styles.container}>
					<Heading style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
						Your @barely.indie submission is in!
					</Heading>

					<Text style={styles.resetText}>Hey {artistName},</Text>

					<Text style={styles.resetText}>
						Thanks for submitting your track to @barely.indie! We've received your
						submission and will review it within 1-2 weeks. You'll hear back from us
						either way.
					</Text>

					<Section style={{ marginTop: '24px', marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							A bit about us:
						</Heading>
						<Text style={styles.resetText}>
							I'm Adam, and I run barely.nyc - a music marketing agency built specifically
							for indie artists who are tired of vague promises and want to see real,
							trackable growth.
						</Text>
						<Text style={styles.resetText}>
							We started the @barely.indie playlists as a way to discover great music and
							connect with artists who are serious about building their careers. Some of
							the artists we've worked with came to us through this exact submission form.
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Our approach: Build your own playlist first
						</Heading>
						<Text style={styles.resetText}>
							The first campaign we usually run for artists isn't getting them on other
							people's playlists - it's helping them build their own. Here's why:
						</Text>
						<Text style={styles.resetText}>
							When you depend on curators (like me) for exposure, you're at the mercy of
							their decisions and timelines. But when you build your own curated playlist,
							you control your discovery channel and generate compound growth.
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Real results from artists like you:
						</Heading>
						<Text style={styles.resetText}>
							<strong>The Now</strong> (Alt Rock, South Wales): Grew from 1,347 → 19,669
							monthly listeners (1,360% growth) in 8 months. We helped them build their
							"ON THE ROAD" playlist to 7K followers, creating a sustainable discovery
							channel that compounds over time.
						</Text>
						<Text style={{ ...styles.resetText, marginTop: '16px' }}>
							<strong>Proper Youth</strong> (Indie Rock, Brooklyn): Achieved 340% listener
							growth (5,579 → 24,516) and 2,730% revenue increase ($112 → $3,170/mo) in 6
							months using iPhone-shot videos and data-driven campaigns.
						</Text>
						<Text style={{ ...styles.resetText, marginTop: '16px' }}>
							<Link
								href='https://barely.nyc/case-studies'
								style={{ color: '#0066cc', textDecoration: 'underline' }}
							>
								→ See all case studies
							</Link>
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Heading
							as='h2'
							style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
						>
							Want to grow like this?
						</Heading>
						<Text style={styles.resetText}>
							Whether or not your track makes it onto one of the @barely.indie playlists,
							I'd love to chat about your growth goals. We work with artists at all stages
							using transparent, performance-based campaigns - starting with building your
							own playlist ecosystem so you're not dependent on gatekeepers.
						</Text>
						<Text style={{ ...styles.resetText, marginTop: '16px' }}>
							<Link
								href='https://cal.com/barely/nyc'
								style={{
									display: 'inline-block',
									padding: '12px 24px',
									backgroundColor: '#8b5cf6',
									color: '#ffffff',
									textDecoration: 'none',
									borderRadius: '6px',
									fontWeight: 'bold',
								}}
							>
								Book a free 15-min discovery call
							</Link>
						</Text>
						<Text style={{ ...styles.resetText, marginTop: '16px' }}>
							No obligation, no pitch deck - just an honest conversation about where
							you're at and whether we can help.
						</Text>
					</Section>

					<Section style={{ marginBottom: '24px' }}>
						<Text style={styles.resetText}>
							Best,
							<br />
							Adam Barito
							<br />
							Founder, barely.nyc
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
							P.S. Follow{' '}
							<Link
								href='https://instagram.com/barely.indie'
								style={{ color: '#666666', textDecoration: 'underline' }}
							>
								@barely.indie on Instagram
							</Link>{' '}
							to stay updated on new playlist additions and indie music discoveries.
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
