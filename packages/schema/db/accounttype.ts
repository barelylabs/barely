import * as z from "zod"

export const accountTypeSchema = z.enum(["oauth", "ad", "business", "fbPage", "igPage"])
