import { Kysely } from 'kysely';
import { PlanetScaleDialect } from 'kysely-planetscale';
import { Link, VisitorSession, Event } from '@prisma/client/edge';

interface DbGeoLocation {
	latitude: number;
	longitude: number;
}

interface DB {
	Link: Link;
	VisitorSession: Partial<VisitorSession>;
	//   VisitorSession: Omit<Omit<VisitorSession, "createdAt">, "id">;
	Event: Event;
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

export const usEast1_dev = connect(
	process.env.US_EAST_1_DEV_HOSTNAME as string,
	process.env.US_EAST_1_DEV_USERNAME as string,
	process.env.US_EAST_1_DEV_PASSWORD as string,
);

export const usEast1 = connect(
	process.env.US_EAST_1_HOSTNAME as string,
	process.env.US_EAST_1_USERNAME as string,
	process.env.US_EAST_1_PASSWORD as string,
);

const usWest2 = connect(
	process.env.US_WEST_2_HOSTNAME as string,
	process.env.US_WEST_2_USERNAME as string,
	process.env.US_WEST_2_PASSWORD as string,
);

const euCentral1 = connect(
	process.env.EU_CENTRAL_1_HOSTNAME as string,
	process.env.EU_CENTRAL_1_USERNAME as string,
	process.env.EU_CENTRAL_1_PASSWORD as string,
);

const euWest1 = connect(
	process.env.EU_WEST_1_HOSTNAME as string,
	process.env.EU_WEST_1_USERNAME as string,
	process.env.EU_WEST_1_PASSWORD as string,
);

const euWest2 = connect(
	process.env.EU_WEST_2_HOSTNAME as string,
	process.env.EU_WEST_2_USERNAME as string,
	process.env.EU_WEST_2_PASSWORD as string,
);

const apNorthEast1 = connect(
	process.env.AP_NORTHEAST_1_HOSTNAME as string,
	process.env.AP_NORTHEAST_1_USERNAME as string,
	process.env.AP_NORTHEAST_1_PASSWORD as string,
);

const apSouthEast1 = connect(
	process.env.AP_SOUTHEAST_1_HOSTNAME as string,
	process.env.AP_SOUTHEAST_1_USERNAME as string,
	process.env.AP_SOUTHEAST_1_PASSWORD as string,
);

const apSouthEast2 = connect(
	process.env.AP_SOUTHEAST_2_HOSTNAME as string,
	process.env.AP_SOUTHEAST_2_USERNAME as string,
	process.env.AP_SOUTHEAST_2_PASSWORD as string,
);

const apSouth1 = connect(
	process.env.AP_SOUTH_1_HOSTNAME as string,
	process.env.AP_SOUTH_1_USERNAME as string,
	process.env.AP_SOUTH_1_PASSWORD as string,
);

const saEast1 = connect(
	process.env.SA_EAST_1_HOSTNAME as string,
	process.env.SA_EAST_1_USERNAME as string,
	process.env.SA_EAST_1_PASSWORD as string,
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

export const closestDbConnection = (
	longitude: string | number,
	latitude: string | number,
): Kysely<DB> => {
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

export function calcCrow(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
