import React from 'react';
import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Preview,
	Row,
	Section,
	Text,
} from '@react-email/components';

import {
	container,
	heading,
	main,
	mutedText,
	outlineButton,
	resetText,
} from '../../styles';

export interface ShippingUpdateEmailProps {
	orderId: string;
	date: Date;
	sellerName: string;
	supportEmail: string;

	trackingNumber: string;
	trackingLink: string;

	shippingAddress?: {
		name: string;
		line1: string | null;
		line2: string | null;
		city: string | null;
		state: string | null;
		postalCode: string | null;
		country: string | null;
	};

	products: {
		name: string;
		apparelSize?: string;
	}[];
}

export default function ShippingUpdateEmail({
	// orderId,
	// date,
	sellerName,
	supportEmail,
	trackingNumber,
	trackingLink,
	shippingAddress,
	products,
}: ShippingUpdateEmailProps) {
	const previewText = `${sellerName} has shipped your order`;

	return (
		// <Tailwind>
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body style={main}>
				<Container style={container}>
					<Section>
						<Hr style={{ margin: 0 }} />

						<Row
							style={{
								backgroundColor: '#f9fafb',
								alignItems: 'center',
								padding: '20px',
							}}
						>
							<Column align='left'>
								<Text style={{ ...resetText, fontWeight: 'bold' }}>Tracking Number</Text>
								<Text style={{ ...resetText, marginTop: '10px' }}>{trackingNumber}</Text>
							</Column>
							<Column>
								<Button style={{ ...outlineButton }} href={trackingLink}>
									Track Order
								</Button>
							</Column>
						</Row>
						<Hr style={{ margin: 0 }} />
					</Section>

					<Section
						style={{
							textAlign: 'center',
							justifyItems: 'center',
							paddingTop: '50px',
							paddingBottom: '30px',
						}}
					>
						<Img
							src={'https://app.barely.io/_static/logo.png'}
							width='42'
							height='42'
							alt='Logo'
							style={{ margin: '0 auto' }}
						/>
						<Text style={{ ...heading, marginTop: '20px', fontWeight: 'bolder' }}>
							Your order has shipped!
						</Text>
						<Text style={{ ...mutedText, marginTop: '10px' }}>
							Your order from {sellerName} has shipped. Use the link above to track its
							progress.
						</Text>
					</Section>
					<Hr />
					<Section
						style={{
							borderCollapse: 'collapse',
							borderSpacing: '0',
							borderRadius: '0.75rem',
							fontSize: '1rem',
						}}
					>
						<Row>
							<Column align='left'>
								<Text style={{ ...resetText, marginTop: '20px', fontWeight: 'bold' }}>
									Shipping to: {shippingAddress?.name}
								</Text>
								<Text style={{ ...resetText, marginTop: '10px', marginBottom: '10px' }}>
									{shippingAddress?.line1},{' '}
									{shippingAddress?.line2 ? `${shippingAddress?.line2} , ` : ' '}
									{shippingAddress?.city}, {shippingAddress?.state},{' '}
									{shippingAddress?.postalCode}, {shippingAddress?.country}
								</Text>
							</Column>
						</Row>

						<Row
							style={{
								marginTop: '8px',
							}}
						>
							<Column>
								<Text
									style={{
										...resetText,
										fontSize: '1.125rem',
										lineHeight: '1.5rem',
										fontWeight: 'bold',
									}}
								>
									Shipped Items
								</Text>
							</Column>
						</Row>

						<Hr />

						{products.map((product, index) => {
							return (
								<Section key={index}>
									<Row style={{ padding: '10px 0' }}>
										<Column style={{ verticalAlign: 'top' }}>
											<Text
												style={{
													...resetText,
													fontSize: '14px',
													lineHeight: 1.25,
													margin: '0',
													padding: '0',
													paddingRight: '8px',
												}}
											>
												{product.name}{' '}
												{product.apparelSize ? `(size: ${product.apparelSize})` : ''}
											</Text>
										</Column>
									</Row>
								</Section>
							);
						})}
						<Hr />
					</Section>

					<Section
						style={{
							marginTop: '24px',
						}}
					>
						<Row>
							<Column>
								<Button style={{ ...outlineButton }} href={`mailto:${supportEmail}`}>
									Contact Support
								</Button>
							</Column>
						</Row>
						<Text
							style={{
								...resetText,
								textAlign: 'center',
								color: '#64748b',
								fontSize: '12px',
								lineHeight: '1rem',
								paddingTop: '8px',
							}}
						>
							If you need any help, please use the link above to contact the creator
							directly.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
		// </Tailwind>
	);
}

ShippingUpdateEmail.PreviewProps = {
	orderId: 'ML4F5L8522',
	sellerName: 'Proper Youth',

	date: new Date(),
	supportEmail: 'support@properyouth.com',

	trackingNumber: '1Z9999999999999999',
	trackingLink: 'https://www.ups.com/track?tracknum=1Z9999999999999999',

	shippingAddress: {
		name: 'Adam Barito',
		line1: '1234 Main St',
		line2: 'Apt 123',
		city: 'San Francisco',
		state: 'CA',
		postalCode: '94103',
		country: 'USA',
	},
	products: [
		{
			name: 'So Close To Paradise :: Autographed CD',
		},
		{
			name: 'Rusty Grand Am T-Shirt',
			apparelSize: 'M',
		},
	],
} satisfies ShippingUpdateEmailProps;
