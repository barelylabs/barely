import * as z from "zod"

export const countryColorCodeSchema = z.enum(["red", "orange", "yellow", "green"])
