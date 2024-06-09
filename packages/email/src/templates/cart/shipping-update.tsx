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

// import {
// 	InformationTableColumn,
// 	InformationTableLabel,
// 	InformationTableRow,
// 	InformationTableValue,
// } from '../../primitives';
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
		// price: string;
		// payWhatYouWantPrice?: string;
		// shipping?: string;
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
					{/* <Section>
						<Row>
							<Column>
								<Img
									src={'https://app.barely.io/_static/logo.png'}
									width='42'
									height='42'
									alt='Logo'
								/>
							</Column>

							<Column align='right' style={{ display: 'table-cell' }}>
								<Text style={{ ...heading, fontWeight: 'bold' }}>Shipping</Text>
							</Column>
						</Row>
					</Section> */}

					{/* <Section>
						<Row>
							<Column align='right'>
								<Text>
									{date.toLocaleDateString(undefined, {
										month: 'long',
										day: 'numeric',
										year: 'numeric',
									})}
								</Text>
							</Column>
						</Row>
					</Section> */}

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
									{shippingAddress?.line1}, {shippingAddress?.line2},{' '}
									{shippingAddress?.city}, {shippingAddress?.state},{' '}
									{shippingAddress?.postalCode}, {shippingAddress?.country}
								</Text>
							</Column>
						</Row>

						<Row
							style={{
								marginTop: '8px',
							}}
							// className='mt-2'
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
												{product.name}
											</Text>
										</Column>

										{/* <Column align='right' style={{ verticalAlign: 'top' }}>
											<Text
												style={{
													fontSize: '14px',
													margin: '0',
													padding: '0',
													lineHeight: 1.4,
												}}
											>
												{product.price}
											</Text>
										</Column> */}
									</Row>
								</Section>
							);
						})}
						<Hr />

						{/* <Section style={{ width: 'fit-content' }} align='right'>
							{shippingTotal && (
								<>
									<Row>
										<Column style={{ display: 'table-cell' }} align='right'>
											<Text style={{ ...resetText, marginTop: '8px' }}>Shipping:</Text>
										</Column>
										<Column
											align='right'
											style={{ display: 'table-cell', width: '90px' }}
										>
											<Text style={{ ...resetText, marginTop: '8px' }}>
												{shippingTotal}
											</Text>
										</Column>
									</Row>
									<Hr />
								</>
							)}

							<Row>
								<Column style={{ display: 'table-cell' }} align='right'>
									<Text style={{ ...resetText, fontWeight: 'bold' }}>Total:</Text>
								</Column>
								<Column align='right' style={{ display: 'table-cell', width: '90px' }}>
									<Text style={{ ...resetText, fontWeight: 'bold' }}>{total}</Text>
								</Column>
							</Row>
						</Section> */}
					</Section>

					<Section
						style={{
							marginTop: '24px',
						}}
						// className='mt-6 sm:mt-20'
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
							// className='text-slate text-center text-xs'
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
	// buyerName: 'Adam Barito',

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
			// price: '$100.00',
			// payWhatYouWantPrice: '$100.00',
			// shipping: '$5.55',
		},
		{
			name: 'Rusty Grand Am :: Pre-Order CD',
			// price: '$10.00',
		},
	],
} satisfies ShippingUpdateEmailProps;
