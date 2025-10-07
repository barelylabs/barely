export function getTrackingLink({
	carrier,
	trackingNumber,
}: {
	carrier: string;
	trackingNumber: string;
}): string {
	const tracking = trackingNumber.replace(/\s/g, ''); // Remove any whitespace from the tracking number

	switch (carrier) {
		case 'usps':
			return `https://tools.usps.com/go/TrackConfirmAction_input?qtc_tLabels1=${tracking}`;
		case 'ups':
			return `https://www.ups.com/track?tracknum=${tracking}`;
		case 'dhl':
			return `https://www.dhl.com/en/express/tracking.html?AWB=${tracking}`;
		case 'royalMail':
			return `https://www.royalmail.com/track-your-item#/tracking-results/${tracking}`;
		case 'evri':
			return `https://www.evri.com/track-parcel/${tracking}`;
		case 'dpd':
			return `https://www.dpd.co.uk/apps/tracking/?reference=${tracking}`;
		default:
			return '';
	}
}

export function getAvailableCarriers(
	shippingCountry: string | null | undefined,
): string[] {
	if (!shippingCountry) {
		// Default to US carriers if country is not set
		return ['usps', 'ups', 'dhl'];
	}

	switch (shippingCountry.toUpperCase()) {
		case 'GB':
		case 'UK':
			return ['royalMail', 'evri', 'dpd'];
		case 'US':
		case 'USA':
			return ['usps', 'ups', 'dhl'];
		default:
			// For other countries, show all carriers for now
			return ['usps', 'ups', 'dhl', 'royalMail', 'evri', 'dpd'];
	}
}
