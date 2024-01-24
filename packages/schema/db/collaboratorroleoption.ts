import * as z from "zod"

export const collaboratorRoleOptionSchema = z.enum(["admin", "marketing"])
