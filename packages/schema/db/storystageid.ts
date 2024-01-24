import * as z from "zod"

export const storyStageIdSchema = z.enum(["draft", "deferred", "backlog", "thisSprint", "inProgress", "inReview", "complete"])
