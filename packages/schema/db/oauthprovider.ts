import * as z from "zod"

export const oAuthProviderSchema = z.enum(["discord", "facebook", "google", "spotify", "tiktok"])
