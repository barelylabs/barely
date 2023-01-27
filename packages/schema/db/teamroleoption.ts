import * as z from "zod"

export const teamRoleOptionSchema = z.enum(["admin", "member"])
