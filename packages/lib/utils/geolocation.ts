import { degToRad } from './number';

function calcCrow(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // km
	const dLat = degToRad(lat2 - lat1);
	const dLon = degToRad(lon2 - lon1);
	const lat1Rad = degToRad(lat1);
	const lat2Rad = degToRad(lat2);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c;
	return d;
}

export { calcCrow };
