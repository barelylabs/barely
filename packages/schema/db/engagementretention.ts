import * as z from "zod"

export const engagementRetentionSchema = z.enum(["day_1", "day_3", "day_7", "day_30", "day_365"])
