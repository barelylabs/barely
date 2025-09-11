import React from 'react';
import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Preview,
	Section,
	Text,
} from '@react-email/components';

import { InvoiceFooter } from '../../components/invoice-footer';
import { container, heading, main, resetText } from '../../styles';

export interface PaymentReceivedEmailProps {
	invoiceNumber: string;
	workspaceName: string;
	workspaceLogo?: string;
	clientName: string;
	clientEmail: string;
	clientCompany?: string;
	amountPaid: string;
	paymentDate: Date;
	paymentMethod?: string;
	transactionId?: string;
	supportEmail: string;
	memo?: string;
}

export function PaymentReceivedEmailTemplate({
	invoiceNumber,
	workspaceName,
	workspaceLogo,
	clientName,
	clientEmail,
	clientCompany,
	amountPaid,
	paymentDate,
	paymentMethod,
	transactionId,
	supportEmail,
	memo,
}: PaymentReceivedEmailProps) {
	const previewText = `Payment received for invoice ${invoiceNumber}`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body style={main}>
				<Container style={container}>
					{/* Header with Logo */}
					{workspaceLogo && (
						<Section style={{ textAlign: 'center', marginBottom: '30px' }}>
							<Img
								src={workspaceLogo}
								width='60'
								height='60'
								alt={workspaceName}
								style={{ margin: '0 auto' }}
							/>
						</Section>
					)}

					{/* Main Heading */}
					<Section style={{ textAlign: 'center', marginBottom: '20px' }}>
						<Text
							style={{
								...heading,
								fontSize: '28px',
								fontWeight: 'bold',
								margin: '0 0 10px 0',
							}}
						>
							Payment Received
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#64748b',
								margin: '0',
							}}
						>
							Invoice #{invoiceNumber} from {workspaceName}
						</Text>
					</Section>

					<Hr style={{ marginTop: '30px', marginBottom: '30px' }} />

					{/* Payment Summary Box */}
					<Section
						style={{
							borderRadius: '8px',
							backgroundColor: '#f9fafb',
							padding: '30px',
							marginBottom: '30px',
							textAlign: 'center',
						}}
					>
						{/* Success Icon */}
						<Img
							src='https://app.barely.ai/_static/icons/invoice-check.png'
							width='48'
							height='48'
							alt='Payment confirmed'
							style={{
								margin: '0 auto 20px auto',
								display: 'block',
							}}
						/>

						{/* Amount Paid */}
						<Text
							style={{
								...resetText,
								fontSize: '36px',
								fontWeight: 'bold',
								margin: '0 0 15px 0',
								color: '#0f172a',
							}}
						>
							{amountPaid}
						</Text>

						{/* Payment Date */}
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#64748b',
								margin: '0 0 10px 0',
							}}
						>
							Paid on{' '}
							<span style={{ textDecoration: 'underline' }}>
								{paymentDate.toLocaleDateString(undefined, {
									month: 'long',
									day: 'numeric',
									year: 'numeric',
								})}
							</span>
						</Text>

						{/* Thank You Message */}
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#0f172a',
								margin: '20px 0 0 0',
								fontWeight: '500',
							}}
						>
							Thank you for your payment!
						</Text>

						{/* Original Invoice Memo */}
						{memo && (
							<Text
								style={{
									...resetText,
									fontSize: '14px',
									color: '#475569',
									margin: '15px 0 0 0',
									lineHeight: '1.5',
								}}
							>
								{memo}
							</Text>
						)}
					</Section>

					{/* Payment Details */}
					<Section
						style={{
							borderRadius: '8px',
							backgroundColor: '#f9fafb',
							padding: '25px',
							marginBottom: '30px',
						}}
					>
						{/* Client Information */}
						<div style={{ marginBottom: '20px' }}>
							<Text
								style={{
									...resetText,
									fontSize: '12px',
									textTransform: 'uppercase',
									letterSpacing: '0.5px',
									color: '#64748b',
									margin: '0 0 8px 0',
									fontWeight: '600',
								}}
							>
								Paid By
							</Text>
							<Text
								style={{
									...resetText,
									fontSize: '16px',
									color: '#0f172a',
									fontWeight: 'bold',
									margin: '0 0 5px 0',
								}}
							>
								{clientName}
							</Text>
							{clientCompany && (
								<Text
									style={{
										...resetText,
										fontSize: '14px',
										color: '#475569',
										margin: '0 0 5px 0',
									}}
								>
									{clientCompany}
								</Text>
							)}
							<Text
								style={{
									...resetText,
									fontSize: '14px',
									color: '#475569',
									margin: '0',
								}}
							>
								{clientEmail}
							</Text>
						</div>

						{/* Divider */}
						{(paymentMethod !== undefined || transactionId !== undefined) && (
							<Hr style={{ margin: '20px 0', borderColor: '#e2e8f0' }} />
						)}

						{/* Payment Method */}
						{paymentMethod && (
							<div style={{ marginBottom: transactionId ? '20px' : '0' }}>
								<Text
									style={{
										...resetText,
										fontSize: '12px',
										textTransform: 'uppercase',
										letterSpacing: '0.5px',
										color: '#64748b',
										margin: '0 0 8px 0',
										fontWeight: '600',
									}}
								>
									Payment Method
								</Text>
								<Text
									style={{
										...resetText,
										fontSize: '14px',
										color: '#0f172a',
										margin: '0',
									}}
								>
									{paymentMethod}
								</Text>
							</div>
						)}

						{/* Transaction ID */}
						{transactionId && (
							<div>
								<Text
									style={{
										...resetText,
										fontSize: '12px',
										textTransform: 'uppercase',
										letterSpacing: '0.5px',
										color: '#64748b',
										margin: '0 0 8px 0',
										fontWeight: '600',
									}}
								>
									Transaction ID
								</Text>
								<Text
									style={{
										...resetText,
										fontSize: '13px',
										color: '#475569',
										fontFamily: 'monospace',
										margin: '0',
									}}
								>
									{transactionId}
								</Text>
							</div>
						)}
					</Section>

					{/* Receipt Notice */}
					<Section style={{ textAlign: 'center', marginBottom: '40px' }}>
						<Text
							style={{
								...resetText,
								fontSize: '14px',
								color: '#64748b',
								margin: '0 0 10px 0',
							}}
						>
							This email serves as your official receipt.
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '14px',
								color: '#64748b',
								margin: '0',
							}}
						>
							Please keep this email for your records.
						</Text>
						{supportEmail && (
							<Text
								style={{
									...resetText,
									fontSize: '14px',
									color: '#64748b',
									margin: '20px 0 0 0',
								}}
							>
								Questions? Contact us at{' '}
								<a
									href={`mailto:${supportEmail}`}
									style={{ color: '#5563eb', textDecoration: 'underline' }}
								>
									{supportEmail}
								</a>
							</Text>
						)}
					</Section>

					{/* Footer */}
					<InvoiceFooter workspaceName={workspaceName} />
				</Container>
			</Body>
		</Html>
	);
}

PaymentReceivedEmailTemplate.PreviewProps = {
	invoiceNumber: 'INV-TEST-000001',
	workspaceName: 'Barely Creative',
	clientName: 'John Smith',
	clientEmail: 'john@example.com',
	clientCompany: 'Smith Industries',
	amountPaid: '$3,588.75',
	paymentDate: new Date(),
	paymentMethod: 'Credit Card (**** 4242)',
	transactionId: 'ch_1234567890abcdef',
	supportEmail: 'support@barely.ai',
} satisfies PaymentReceivedEmailProps;

export default PaymentReceivedEmailTemplate;
