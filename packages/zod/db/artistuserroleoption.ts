import * as z from "zod"

export const artistUserRoleOptionSchema = z.enum(["admin", "manager", "artist"])
