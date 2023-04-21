import Pusher from 'pusher';

import env from '../env';

const pusher = new Pusher({
	appId: env.NEXT_PUBLIC_PUSHER_APP_ID,
	key: env.NEXT_PUBLIC_PUSHER_APP_KEY,
	secret: env.PUSHER_APP_SECRET,
	cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
});

export { pusher };
