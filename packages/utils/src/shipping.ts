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
		default:
			return '';
	}
}
