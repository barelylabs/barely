import * as z from "zod"

export const artistUserRoleOptionSchema = z.enum(["artist", "agent", "label", "manager", "publisher"])
