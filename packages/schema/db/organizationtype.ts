import * as z from "zod"

export const organizationTypeSchema = z.enum(["label", "agency"])
