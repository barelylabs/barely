import * as z from "zod"

export const analyticsPlatformSchema = z.enum(["meta", "google", "tiktok", "snapchat"])
