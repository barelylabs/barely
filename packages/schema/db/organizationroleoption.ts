import * as z from "zod"

export const organizationRoleOptionSchema = z.enum(["admin", "member"])
