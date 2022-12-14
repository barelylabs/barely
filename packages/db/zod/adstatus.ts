import * as z from "zod"

export const adStatusSchema = z.enum(["ACTIVE", "PAUSED", "ERROR"])
