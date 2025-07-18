// Types for domain constants
export interface InsertDomain {
	domain: string;
	workspaceId: string;
	type: 'link' | 'page' | 'other';
	verified: boolean;
	target?: string;
	description?: string;
	clicks?: number;
}

export interface NextGeo {
	city?: string;
	region?: string;
	country?: string;
	latitude?: string;
	longitude?: string;
	zip?: string;
}

export const DUMMY_GEO_DATA: NextGeo[] = [
	{
		city: 'London',
		region: 'England',
		country: 'GB',
		latitude: '51.5074',
		longitude: '-0.1278',
		zip: 'EC1A 1BB',
	},
	{
		city: 'Manchester',
		region: 'England',
		country: 'GB',
		latitude: '53.4808',
		longitude: '-2.2426',
		zip: 'M1 1AA',
	},
	{
		city: 'Toronto',
		region: 'Ontario',
		country: 'CA',
		latitude: '43.6532',
		longitude: '-79.3832',
		zip: 'M1 1AA',
	},
	{
		city: 'Sydney',
		region: 'New South Wales',
		country: 'AU',
		latitude: '-33.8688',
		longitude: '151.2093',
		zip: '2000',
	},
	{
		city: 'Auckland',
		region: 'Auckland',
		country: 'NZ',
		latitude: '-36.8485',
		longitude: '174.7633',
		zip: '1010',
	},
	{
		city: 'New York',
		region: 'NY',
		country: 'US',
		latitude: '40.7128',
		longitude: '74.0060',
		zip: '10001',
	},
	{
		city: 'Los Angeles',
		region: 'CA',
		country: 'US',
		latitude: '34.0522',
		longitude: '118.2437',
		zip: '90001',
	},
	{
		city: 'Chicago',
		region: 'IL',
		country: 'US',
		latitude: '41.8781',
		longitude: '87.6298',
		zip: '60601',
	},
	{
		city: 'Houston',
		region: 'TX',
		country: 'US',
		latitude: '29.7604',
		longitude: '95.3698',
		zip: '77001',
	},
	{
		city: 'Phoenix',
		region: 'AZ',
		country: 'US',
		latitude: '33.4484',
		longitude: '112.0740',
		zip: '85001',
	},
];

export const ccTLDs = new Set([
	'af',
	'ax',
	'al',
	'dz',
	'as',
	'ad',
	'ao',
	'ai',
	'aq',
	'ag',
	'ar',
	'am',
	'aw',
	'ac',
	'au',
	'at',
	'az',
	'bs',
	'bh',
	'bd',
	'bb',
	'eus',
	'by',
	'be',
	'bz',
	'bj',
	'bm',
	'bt',
	'bo',
	'bq',
	'an',
	'nl',
	'ba',
	'bw',
	'bv',
	'br',
	'io',
	'vg',
	'bn',
	'bg',
	'bf',
	'mm',
	'bi',
	'kh',
	'cm',
	'ca',
	'cv',
	'cat',
	'ky',
	'cf',
	'td',
	'cl',
	'cn',
	'cx',
	'cc',
	'co',
	'km',
	'cd',
	'cg',
	'ck',
	'cr',
	'ci',
	'hr',
	'cu',
	'cw',
	'cy',
	'cz',
	'dk',
	'dj',
	'dm',
	'do',
	'tl',
	'tp',
	'ec',
	'eg',
	'sv',
	'gq',
	'er',
	'ee',
	'et',
	'eu',
	'fk',
	'fo',
	'fm',
	'fj',
	'fi',
	'fr',
	'gf',
	'pf',
	'tf',
	'ga',
	'gal',
	'gm',
	'ps',
	'ge',
	'de',
	'gh',
	'gi',
	'gr',
	'gl',
	'gd',
	'gp',
	'gu',
	'gt',
	'gg',
	'gn',
	'gw',
	'gy',
	'ht',
	'hm',
	'hn',
	'hk',
	'hu',
	'is',
	'in',
	'id',
	'ir',
	'iq',
	'ie',
	'im',
	'il',
	'it',
	'jm',
	'jp',
	'je',
	'jo',
	'kz',
	'ke',
	'ki',
	'kw',
	'kg',
	'la',
	'lv',
	'lb',
	'ls',
	'lr',
	'ly',
	'li',
	'lt',
	'lu',
	'mo',
	'mk',
	'mg',
	'mw',
	'my',
	'mv',
	'ml',
	'mt',
	'mh',
	'mq',
	'mr',
	'mu',
	'yt',
	'mx',
	'md',
	'mc',
	'mn',
	'me',
	'ms',
	'ma',
	'mz',
	'mm',
	'na',
	'nr',
	'np',
	'nl',
	'nc',
	'nz',
	'ni',
	'ne',
	'ng',
	'nu',
	'nf',
	'nc',
	'tr',
	'kp',
	'mp',
	'no',
	'om',
	'pk',
	'pw',
	'ps',
	'pa',
	'pg',
	'py',
	'pe',
	'ph',
	'pn',
	'pl',
	'pt',
	'pr',
	'qa',
	'ro',
	'ru',
	'rw',
	're',
	'bq',
	'an',
	'bl',
	'gp',
	'fr',
	'sh',
	'kn',
	'lc',
	'mf',
	'gp',
	'fr',
	'pm',
	'vc',
	'ws',
	'sm',
	'st',
	'sa',
	'sn',
	'rs',
	'sc',
	'sl',
	'sg',
	'bq',
	'an',
	'nl',
	'sx',
	'an',
	'sk',
	'si',
	'sb',
	'so',
	'so',
	'za',
	'gs',
	'kr',
	'ss',
	'es',
	'lk',
	'sd',
	'sr',
	'sj',
	'sz',
	'se',
	'ch',
	'sy',
	'tw',
	'tj',
	'tz',
	'th',
	'tg',
	'tk',
	'to',
	'tt',
	'tn',
	'tr',
	'tm',
	'tc',
	'tv',
	'ug',
	'ua',
	'ae',
	'uk',
	'us',
	'vi',
	'uy',
	'uz',
	'vu',
	'va',
	've',
	'vn',
	'wf',
	'eh',
	'ma',
	'ye',
	'zm',
	'zw',
]);

export const SPECIAL_APEX_DOMAINS = new Set([
	'my.id',
	'github.io',
	'vercel.app',
	'now.sh',
	'pages.dev',
	'webflow.io',
	'netlify.app',
	'fly.dev',
	'web.app',
]);

export const SECOND_LEVEL_DOMAINS = new Set([
	'com',
	'co',
	'net',
	'org',
	'edu',
	'gov',
	'in',
]);

export const GOOGLE_FAVICON_URL = 'https://www.google.com/s2/favicons?sz=64&domain_url=';
