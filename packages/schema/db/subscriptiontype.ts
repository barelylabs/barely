import * as z from "zod"

export const subscriptionTypeSchema = z.enum(["campaignMaintenance", "links"])
