import * as z from "zod"

export const teamTypeSchema = z.enum(["artist", "creator", "influencer", "product"])
