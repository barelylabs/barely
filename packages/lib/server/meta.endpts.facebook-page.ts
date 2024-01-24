import { z } from "zod";

import { zGet } from "../utils/zod-fetch";

interface FacebookPagesByUserProps {
  facebookUserId: string;
}

export function byUser({ facebookUserId }: FacebookPagesByUserProps) {
  const accounts = zGet(
    `https://graph.facebook.com/v15.0/${facebookUserId}/accounts`,
    fbPagesResponseSchema,
  );
  return accounts;
}

const fbPagesResponseSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    access_token: z.string(),
  }),
);
