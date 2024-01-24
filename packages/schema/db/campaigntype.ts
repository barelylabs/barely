import * as z from "zod"

export const campaignTypeSchema = z.enum(["playlistPitch", "fbSpark", "igSpark", "tiktokSpark", "playlistSpark", "gigSpark", "fbCharge", "igCharge", "spotifyCharge"])
