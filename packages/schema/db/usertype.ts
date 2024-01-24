import * as z from "zod"

export const userTypeSchema = z.enum(["label", "artist", "creator", "influencer", "marketer"])
