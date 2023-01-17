import * as z from "zod"

export const paymentTypeSchema = z.enum(["oneTime", "subscription"])
