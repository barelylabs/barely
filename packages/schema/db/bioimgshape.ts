import * as z from "zod"

export const bioImgShapeSchema = z.enum(["square", "circle", "rounded"])
