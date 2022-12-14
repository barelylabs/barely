import * as z from "zod"

export const adPlatformSchema = z.enum(["meta", "google", "tiktok", "snapchat"])
