import * as z from "zod"

export const accountPlatformSchema = z.enum(["discord", "facebook", "facebookPage", "github", "google", "metaAd", "metaBusiness", "spotify", "tiktok", "twitch", "twitter", "whatsapp"])
