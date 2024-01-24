import * as z from "zod"

export const streamingPlatformSchema = z.enum(["appleMusic", "spotify", "youtube"])
