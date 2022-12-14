import { usEast1 } from '@barely/db/kysely';

export const config = {
    runtime: 'experimental-edge',
};

export default async function handler() {
    const games = await usEast1.selectFrom('Link').selectAll().execute();

    return new Response(JSON.stringify({ games }), {
        status: 200,
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'access-control-allow-origin': '*',
        },
    });
}
