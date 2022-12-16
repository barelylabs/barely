import { usEast1 } from "@barely/db/kysely";

export const config = {
  runtime: "experimental-edge",
};

export default async function handler() {
  const links = await usEast1.selectFrom("Link").selectAll().execute();
  // const links = {
  //   fromDb: usEast1Host ?? "nuthin",
  //   fromEnv: process.env.US_EAST_1_HOSTNAME ?? "still nuthin",
  // };
  return new Response(JSON.stringify({ links }), {
    status: 200,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "access-control-allow-origin": "*",
    },
  });
}
