import { geolocation } from '@vercel/edge';
import { closestDbConnection } from '@barely/db/kysely';

export const config = {
    runtime: 'experimental-edge',
};

export default async function handler(req: Request) {
    const { longitude, latitude } = geolocation(req);

    const links = await closestDbConnection(longitude ?? '0', latitude ?? '0')
        .selectFrom('Link')
        .selectAll()
        .execute();

    return new Response(JSON.stringify({ links }), {
        status: 200,
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'access-control-allow-origin': '*',
        },
    });
}
