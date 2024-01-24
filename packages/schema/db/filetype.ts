import * as z from "zod"

export const fileTypeSchema = z.enum(["audio", "video", "image"])
