import * as z from "zod"

export const pitchReviewStageSchema = z.enum(["reviewing", "placed", "rejected", "expired"])
