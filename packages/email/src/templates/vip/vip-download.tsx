import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from '@react-email/components';

import { EmailFooterVip } from '../../components/email-footer-vip';
import { EmailHeaderLogo } from '../../components/email-header-logo';

interface VipDownloadEmailProps {
	artistName?: string;
	artistSupportEmail?: string;
	swapName: string;
	downloadUrl: string;
	downloadTitle?: string;
	emailBody?: string;
	expiresIn?: string;
}

export function VipDownloadEmailTemplate({
	artistName = 'Artist',
	artistSupportEmail,
	swapName,
	downloadUrl,
	downloadTitle,
	emailBody,
	expiresIn = '24 hours',
}: VipDownloadEmailProps) {
	const previewText = `Download ${swapName} from ${artistName}`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={main}>
				<Container style={container}>
					<div style={{ marginBottom: '32px' }}>
						<EmailHeaderLogo />
					</div>

					<Heading style={h1}>
						{downloadTitle ?? `🎵 Your exclusive ${swapName} download is ready!`}
					</Heading>

					<Section style={section}>
						<Text style={text}>Hi there,</Text>
						<Text
							style={text}
							dangerouslySetInnerHTML={{
								__html:
									emailBody ??
									`Thanks for being an early supporter of ${artistName}. As promised, here's your exclusive access to <i>${swapName}</i>. This download link will expire in ${expiresIn}, so grab it while it's hot!`,
							}}
						/>

						<Section style={buttonSection}>
							<Button style={button} href={downloadUrl}>
								Download {swapName}
							</Button>
						</Section>

						<Text style={smallText}>
							⏰ This download link will expire in {expiresIn}. If you have any issues,
							please contact{' '}
							{artistSupportEmail ?
								<Link href={`mailto:${artistSupportEmail}`} style={{ color: '#3182ce' }}>
									{artistName}
								</Link>
							:	artistName}
							.
						</Text>
					</Section>

					<Hr style={hr} />

					<EmailFooterVip />
				</Container>
			</Body>
		</Html>
	);
}

// Styles
const main = {
	backgroundColor: '#ffffff',
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: '0 auto',
	padding: '20px 0 48px',
	maxWidth: '560px',
};

const section = {
	padding: '24px',
	backgroundColor: '#f9f9f9',
	borderRadius: '8px',
	marginBottom: '24px',
};

const h1 = {
	color: '#1a1a1a',
	fontSize: '24px',
	fontWeight: '600',
	lineHeight: '40px',
	margin: '0 0 20px',
	textAlign: 'left' as const,
};

const text = {
	color: '#444',
	fontSize: '16px',
	lineHeight: '26px',
	margin: '0 0 16px',
};

const smallText = {
	color: '#666',
	fontSize: '14px',
	lineHeight: '24px',
	margin: '16px 0 0',
};

const buttonSection = {
	textAlign: 'left' as const,
	margin: '32px 0',
};

const button = {
	backgroundColor: '#000',
	borderRadius: '8px',
	color: '#fff',
	fontSize: '16px',
	fontWeight: '600',
	textDecoration: 'none',
	textAlign: 'center' as const,
	display: 'inline-block',
	padding: '12px 32px',
};

const hr = {
	borderColor: '#e8e8e8',
	margin: '32px 0',
};

export default VipDownloadEmailTemplate;
