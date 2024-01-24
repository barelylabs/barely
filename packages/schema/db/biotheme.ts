import * as z from "zod"

export const bioThemeSchema = z.enum(["light", "dark", "app"])
