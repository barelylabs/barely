import * as z from "zod"

export const eventTypeSchema = z.enum(["pageView", "linkClick", "formOpen", "formSubmit", "presaveSpotifyOpen", "presaveSpotifyComplete"])
