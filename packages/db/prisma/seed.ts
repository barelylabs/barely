// import * as dotenv from "dotenv";
// dotenv.config({ path: "../../../.env" });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seed = async () => {
	// create genres
	await prisma.genre.createMany({
		data: [
			{ name: 'Alternative' },
			{ name: 'Ambient' },
			{ name: 'Blues' },
			{ name: 'Classical' },
			{ name: 'Country' },
			{ name: 'Dance' },
			{ name: 'Electronic' },
			{ name: 'Folk' },
			{ name: 'Hip Hop' },
			{ name: 'Indie' },
			{ name: 'Jazz' },
			{ name: 'Latin' },
			{ name: 'Metal' },
			{ name: 'Pop' },
			{ name: 'Punk' },
			{ name: 'R&B' },
			{ name: 'Reggae' },
			{ name: 'Rock' },
			{ name: 'Soul' },
			{ name: 'World' },
		],
	});
};

// const load = async () => {
//   await prisma.link.deleteMany();
//   await prisma.event.deleteMany();
//   await prisma.artist.deleteMany();
//   await prisma.user.deleteMany();

//   const barelysparrow = await prisma.user.upsert({
//     where: { email: "adam@barelysparrow.com" },
//     update: {},
//     create: {
//       firstName: "Adam",
//       lastName: "Barito",
//       name: "adambarito",
//       email: "adam@barelysparrow.com",
//       artists: {
//         create: {
//           handle: "properyouth",
//           name: "Proper Youth",
//           links: {
//             create: {
//               app: "spotify",
//               url: "https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb?si=6f7f7c8f1f3a4b8a",
//             },
//           },
//           analytics: {
//             create: {
//               analyticsEndpoint: {
//                 create: {
//                   platform: "meta",
//                   id: process.env.PROPERYOUTH_PIXEL_ID as string,
//                   accessToken: process.env
//                     .PROPERYOUTH_PIXEL_ACCESS_TOKEN as string,
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });
// };

// // const meta = await prisma.remark

seed()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		// process.exit(1);
	});
