import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from '@react-email/components';

import { EmailFooterVip } from '../../components/email-footer-vip';
import { EmailHeaderLogo } from '../../components/email-header-logo';

interface ReleaseNotificationEmailProps {
	artistName?: string;
	trackName?: string;
	spotifyUrl?: string;
}

export function ReleaseNotificationEmailTemplate({
	artistName = 'Artist',
	trackName = 'New Track',
	spotifyUrl,
}: ReleaseNotificationEmailProps) {
	const previewText = `${trackName} by ${artistName} is out now!`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={main}>
				<Container style={container}>
					<div style={{ marginBottom: '32px' }}>
						<EmailHeaderLogo />
					</div>

					<Heading style={h1}>It&apos;s out! 🎶</Heading>

					<Text style={text}>
						<strong>{trackName}</strong> by <strong>{artistName}</strong> is now available
						on Spotify.
					</Text>

					<Text style={text}>
						You pre-saved this track, so it should already be in your Spotify library. If
						not, tap the button below to listen now.
					</Text>

					{spotifyUrl && (
						<Section style={{ textAlign: 'center', marginTop: '24px' }}>
							<Button style={button} href={spotifyUrl}>
								Listen on Spotify
							</Button>
						</Section>
					)}

					<Hr style={hr} />

					<EmailFooterVip />
				</Container>
			</Body>
		</Html>
	);
}

export default ReleaseNotificationEmailTemplate;

const main = {
	backgroundColor: '#ffffff',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
	margin: '0 auto',
	padding: '20px 0 48px',
	maxWidth: '560px',
};

const h1 = {
	color: '#1a1a1a',
	fontSize: '24px',
	fontWeight: '600' as const,
	lineHeight: '32px',
	margin: '0 0 16px',
};

const text = {
	color: '#444',
	fontSize: '16px',
	lineHeight: '26px',
	margin: '0 0 10px',
};

const button = {
	backgroundColor: '#1DB954',
	borderRadius: '24px',
	color: '#fff',
	fontSize: '16px',
	fontWeight: '600' as const,
	textDecoration: 'none',
	textAlign: 'center' as const,
	display: 'inline-block',
	padding: '12px 32px',
};

const hr = {
	borderColor: '#e6ebf1',
	margin: '20px 0',
};
