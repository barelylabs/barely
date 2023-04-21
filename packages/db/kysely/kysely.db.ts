import { Kysely } from 'kysely';
import { PlanetScaleDialect } from 'kysely-planetscale';

import env from '../env';
import { DB } from './kysely.types';

interface DbGeoLocation {
	latitude: number;
	longitude: number;
}

interface ConfigWithGeoLocation {
	dbConnection: Kysely<DB>;
	geoLocation: DbGeoLocation;
}

const connect = (host: string, username: string, password: string): Kysely<DB> => {
	return new Kysely<DB>({
		dialect: new PlanetScaleDialect({
			host,
			username,
			password,
		}),
	});
};

const databaseUrlRegex = /^mysql:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)\?sslaccept=(.+)$/i;
const usEast1Props = env.DATABASE_URL.match(databaseUrlRegex);
if (!usEast1Props) {
	throw new Error('DATABASE_URL is not valid');
}

const [, usEast1Username, usEast1Password, usEast1Host] = usEast1Props;

const usEast1 = connect(usEast1Host, usEast1Username, usEast1Password);

const usWest2 = connect(
	process.env.PLANETSCALE_US_WEST_2_HOSTNAME as string,
	process.env.PLANETSCALE_US_WEST_2_USERNAME as string,
	process.env.PLANETSCALE_US_WEST_2_PASSWORD as string,
);

const euCentral1 = connect(
	process.env.PLANETSCALE_EU_CENTRAL_1_HOSTNAME as string,
	process.env.PLANETSCALE_EU_CENTRAL_1_USERNAME as string,
	process.env.PLANETSCALE_EU_CENTRAL_1_PASSWORD as string,
);

const euWest1 = connect(
	process.env.PLANETSCALE_EU_WEST_1_HOSTNAME as string,
	process.env.PLANETSCALE_EU_WEST_1_USERNAME as string,
	process.env.PLANETSCALE_EU_WEST_1_PASSWORD as string,
);

const euWest2 = connect(
	process.env.PLANETSCALE_EU_WEST_2_HOSTNAME as string,
	process.env.PLANETSCALE_EU_WEST_2_USERNAME as string,
	process.env.PLANETSCALE_EU_WEST_2_PASSWORD as string,
);

const apNorthEast1 = connect(
	process.env.PLANETSCALE_AP_NORTHEAST_1_HOSTNAME as string,
	process.env.PLANETSCALE_AP_NORTHEAST_1_USERNAME as string,
	process.env.PLANETSCALE_AP_NORTHEAST_1_PASSWORD as string,
);

const apSouthEast1 = connect(
	process.env.PLANETSCALE_AP_SOUTHEAST_1_HOSTNAME as string,
	process.env.PLANETSCALE_AP_SOUTHEAST_1_USERNAME as string,
	process.env.PLANETSCALE_AP_SOUTHEAST_1_PASSWORD as string,
);

const apSouthEast2 = connect(
	process.env.PLANETSCALE_AP_SOUTHEAST_2_HOSTNAME as string,
	process.env.PLANETSCALE_AP_SOUTHEAST_2_USERNAME as string,
	process.env.PLANETSCALE_AP_SOUTHEAST_2_PASSWORD as string,
);

const apSouth1 = connect(
	process.env.PLANETSCALE_AP_SOUTH_1_HOSTNAME as string,
	process.env.PLANETSCALE_AP_SOUTH_1_USERNAME as string,
	process.env.PLANETSCALE_AP_SOUTH_1_PASSWORD as string,
);

const saEast1 = connect(
	process.env.PLANETSCALE_SA_EAST_1_HOSTNAME as string,
	process.env.PLANETSCALE_SA_EAST_1_USERNAME as string,
	process.env.PLANETSCALE_SA_EAST_1_PASSWORD as string,
);

const dbConnectionsWithGeoLocation: ConfigWithGeoLocation[] = [
	{
		// Frankfurt
		dbConnection: euCentral1,
		geoLocation: {
			latitude: 50.110924,
			longitude: 8.682127,
		},
	},
	{
		// Dublin
		dbConnection: euWest1,
		geoLocation: {
			latitude: 53.35014,
			longitude: -6.266155,
		},
	},
	{
		// London
		dbConnection: euWest2,
		geoLocation: {
			latitude: 51.507359,
			longitude: -0.136439,
		},
	},
	{
		// Portland, Oregon
		dbConnection: usWest2,
		geoLocation: {
			latitude: 45.523064,
			longitude: -122.676483,
		},
	},
	{
		// Northern Virginia
		dbConnection: usEast1,
		geoLocation: {
			latitude: 37.926868,
			longitude: -78.024902,
		},
	},
	{
		// Tokyo
		dbConnection: apNorthEast1,
		geoLocation: {
			latitude: 35.6762,
			longitude: 139.6503,
		},
	},
	{
		// Singapore
		dbConnection: apSouthEast1,
		geoLocation: {
			longitude: 103.851959,
			latitude: 1.29027,
		},
	},
	{
		// Sydney
		dbConnection: apSouthEast2,
		geoLocation: {
			longitude: 151.2099,
			latitude: -33.865143,
		},
	},
	{
		// Mumbai
		dbConnection: apSouth1,
		geoLocation: {
			longitude: 72.877426,
			latitude: 19.07609,
		},
	},
	{
		// Sao Paulo
		dbConnection: saEast1,
		geoLocation: {
			longitude: -46.62529,
			latitude: -23.533773,
		},
	},
];

const closestKyselyPortal = (
	longitude?: string | number,
	latitude?: string | number,
): Kysely<DB> => {
	if (
		env.VERCEL_ENV !== 'production' ||
		longitude === undefined ||
		latitude === undefined
	)
		return usEast1;

	let closestConnection = usEast1;
	let closestDistance = Number.MAX_SAFE_INTEGER;

	dbConnectionsWithGeoLocation.forEach(config => {
		const distanceBetweenLocationAndConfig = calcCrow(
			parseFloat(latitude.toString()),
			parseFloat(longitude.toString()),
			config.geoLocation.latitude,
			config.geoLocation.longitude,
		);

		if (distanceBetweenLocationAndConfig < closestDistance) {
			closestConnection = config.dbConnection;
			closestDistance = distanceBetweenLocationAndConfig;
		}
	});
	return closestConnection;
};

function calcCrow(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // km
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const lat1Rad = toRad(lat1);
	const lat2Rad = toRad(lat2);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c;
	return d;
}

// Value to radians
function toRad(value: number): number {
	return (value * Math.PI) / 180;
}

export { closestKyselyPortal as closestKyselyRead, usEast1 as kyselyWrite, type DB };
