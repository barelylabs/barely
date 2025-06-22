'use server';

// import type { EventTrackingProps } from '@barely/lib/server/routes/event/event-report.schema';
// import type { EventTrackingProps } from '@barely/lib/server/routes/event/event-report.schema';
import { cookies } from 'next/headers';

// import { EventTrackingKeys } from '@barely/lib/server/routes/event/event-report.schema';

// import { EventTrackingKeys } from '@barely/lib/server/routes/event/event-report.schema';

// export async function setCartCookie({
// 	handle,
// 	key,
// 	cartId,
// 	tracking,
// }: {
// 	handle: string;
// 	key: string;
// 	cartId: string;
// 	// tracking: EventTrackingProps;
// }) {
// 	await Promise.resolve();
// 	cookies().set(`${handle}.${key}.cartId`, cartId, {
// 		maxAge: 60 * 60 * 24 * 7, // 7 days
// 	});

// 	// const { fbclid, refererId, fanId, landingPageId,  } = tracking;

// 	for (const key of EventTrackingKeys) {
// 		const value = tracking[key];
// 		if (value) {
// 			cookies().set(`${handle}.${key}.${key}`, value, {
// 				maxAge: 60 * 60 * 24 * 7, // 7 days
// 			});
// 		}
// 	}
// }

export async function setCartIdCookie({
	handle,
	key,
	cartId,
}: {
	handle: string;
	key: string;
	cartId: string;
}) {
	(await cookies()).set(`${handle}.${key}.cartId`, cartId, {
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});
}

export async function setCartStageCookie({
	handle,
	key,
	stage,
}: {
	handle: string;
	key: string;
	stage: string;
}) {
	(await cookies()).set(`${handle}.${key}.cartStage`, stage, {
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});
}
