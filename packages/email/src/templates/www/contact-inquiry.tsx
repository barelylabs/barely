import React from 'react';
import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from '@react-email/components';

interface ContactInquiryEmailProps {
	name: string;
	email: string;
	artistName?: string;
	message: string;
	variant: 'demo' | 'support';
}

export function ContactInquiryEmail({
	name,
	email,
	artistName,
	message,
	variant,
}: ContactInquiryEmailProps) {
	const subject = variant === 'demo' ? 'Demo Request' : 'Support Inquiry';

	return (
		<Html>
			<Head />
			<Preview>New {subject} from barely.io</Preview>
			<Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f6f6' }}>
				<Container style={{ margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
					<Heading style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
						New {subject} from barely.io
					</Heading>

					<Hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

					<Section>
						<Text style={{ fontSize: '16px', marginBottom: '10px' }}>
							<strong>Name:</strong> {name}
						</Text>
						<Text style={{ fontSize: '16px', marginBottom: '10px' }}>
							<strong>Email:</strong> {email}
						</Text>
						{artistName && (
							<Text style={{ fontSize: '16px', marginBottom: '10px' }}>
								<strong>Artist/Label:</strong> {artistName}
							</Text>
						)}
					</Section>

					<Hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

					<Section>
						<Text style={{ fontSize: '16px', marginBottom: '10px' }}>
							<strong>Message:</strong>
						</Text>
						<Text style={{ fontSize: '16px', whiteSpace: 'pre-wrap' }}>{message}</Text>
					</Section>

					<Hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

					<Text style={{ fontSize: '12px', color: '#666' }}>
						This email was sent from the barely.io contact form.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

ContactInquiryEmail.PreviewProps = {
	name: 'John Doe',
	email: 'john@example.com',
	artistName: 'Test Artist',
	message:
		"I'm interested in learning more about barely.io and how it can help me grow my music career.",
	variant: 'demo' as const,
} satisfies ContactInquiryEmailProps;

export default ContactInquiryEmail;
