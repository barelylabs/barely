import * as z from "zod"

export const appTypeSchema = z.enum(["appleMusic", "email", "facebook", "instagram", "patreon", "snapchat", "spotify", "tiktok", "twitch", "twitter", "web", "whatsapp", "youtube"])
