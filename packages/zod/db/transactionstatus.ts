import * as z from "zod"

export const transactionStatusSchema = z.enum(["created", "pending", "succeeded", "failed"])
