import * as z from "zod"

export const formPlatformSchema = z.enum(["bio", "meta"])
