import * as z from "zod"

export const renderStatusSchema = z.enum(["queued", "rendering", "failed", "complete"])
