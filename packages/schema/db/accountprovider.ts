import * as z from "zod"

export const accountProviderSchema = z.enum(["discord", "facebook", "google", "instagram", "meta", "spotify", "tiktok"])
