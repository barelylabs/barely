import * as z from "zod"

export const genderSchema = z.enum(["male", "female", "all"])
