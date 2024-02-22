import { z } from "zod";

import type { NextGeo } from "./next.schema";
import { env } from "../env";
import { sha256 } from "../utils/hash";
import { log } from "../utils/log";
import { zPost } from "../utils/zod-fetch";
import { z_optStr_hash, z_optStr_lowerCase_hash } from "../utils/zod-helpers";

interface MetaEventProps {
  pixelId: string;
  accessToken: string;
  // event data
  url: string;
  ip?: string;
  ua?: string;
  eventName: "ViewContent" | "Barely_LinkClick";
  time?: number;
  geo?: NextGeo;
  eventId?: string;
  testEventCode?: string;
}

export async function reportEventToMeta(props: MetaEventProps) {
  const { ip, geo, ua, time } = props;
  const { pixelId, accessToken, url, eventName } = props;

  const userData = metaUserDataSchema.parse({
    ip,
    ua,
    city: geo?.city,
    state: geo?.region,
    country: geo?.country,
  });

  const serverEventData = metaServerEventSchema.parse({
    eventName,
    eventTime: Math.floor(time ?? Date.now() / 1000),
    actionSource: "website",
    sourceUrl: url,
  });

  const testEventCode =
    env.VERCEL_ENV === "development" ? env.META_TEST_EVENT_CODE : undefined;

  if (testEventCode)
    await log({
      type: "link",
      fn: "reportEventToMeta",
      message: `testEventCode => ${testEventCode}`,
    });
  try {
    const metaEventResJson = await zPost(
      `https://graph.facebook.com/v15.0/${pixelId}/events`,
      metaEventResponseSchema,
      {
        body: {
          access_token: accessToken,
          data: [{ user_data: userData, ...serverEventData }],
          ...(testEventCode !== undefined && {
            test_event_code: testEventCode,
          }),
        },
      },
    );

    console.log("metaEventResponse => ", metaEventResJson);
    return { reported: true };
  } catch (err) {
    return { reported: false, error: err as string };
  }
}

export const metaUserDataSchema = z
  .object({
    email: z
      .string()
      .email()
      .optional()
      .transform((em) => sha256(em)), // email
    phone: z_optStr_hash, // phone
    firstName: z_optStr_hash, // first name
    lastName: z_optStr_hash, // last name
    dateOfBirth: z_optStr_hash, // date of birth
    gender: z.enum(["m", "fm"]).optional(), // gender
    city: z_optStr_lowerCase_hash, // city
    state: z_optStr_lowerCase_hash, // state
    zipCode: z_optStr_lowerCase_hash, // zip
    country: z_optStr_lowerCase_hash, // country
    ip: z.string().optional(), // ip
    ua: z.string(), // ua -- required for web events
    leadId: z.string().optional(), // lead id
    externalId: z_optStr_hash, // external id
  })
  // https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
  .transform((obj) => ({
    em: obj.email,
    ph: obj.phone,
    fn: obj.firstName,
    ln: obj.lastName,
    db: obj.dateOfBirth,
    ge: obj.gender,
    ct: obj.city,
    st: obj.state,
    zp: obj.zipCode,
    country: obj.country,
    external_id: obj.externalId,
    client_ip_address: obj.ip,
    client_user_agent: obj.ua,
    lead_id: obj.leadId,
  }));

export const metaServerEventSchema = z
  .object({
    // required
    eventName: z.string().min(1).max(40),
    eventTime: z.number().int().min(0),
    // userData: metaUserDataSchema,
    actionSource: z.enum(["website", "mobile_app"]),
    sourceUrl: z.string().url(),
    // optional
    customData: z.record(z.string()).optional(),
    optOut: z.boolean().optional(),
    eventId: z.string().optional(),
  })
  // https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event
  .transform((obj) => ({
    event_name: obj.eventName,
    event_time: obj.eventTime,
    // user_data: obj.userData,
    action_source: obj.actionSource,
    event_source_url: obj.sourceUrl,
    custom_data: obj.customData,
    opt_out: obj.optOut,
    event_id: obj.eventId,
  }));

export const metaEventResponseSchema = z.object({
  events_received: z.number().optional(),
  messages: z.array(z.string()).optional(),
  fbtrace_id: z.string().optional(),
  error: z
    .object({
      message: z.string(),
      type: z.string(),
      code: z.number(),
      error_subcode: z.number().optional(),
      error_user_title: z.string().optional(),
      error_user_msg: z.string().optional(),
      is_transient: z.boolean().optional(),
      fbtrace_id: z.string().optional(),
    })
    .optional(),
});
