import * as z from "zod"

export const fileExtensionSchema = z.enum(["mp3", "wav", "jpg", "png", "mp4", "mov"])
