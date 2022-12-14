import * as z from "zod"

export const vidViewsMetricSchema = z.enum(["view_1s", "view_15s", "view_60s"])
