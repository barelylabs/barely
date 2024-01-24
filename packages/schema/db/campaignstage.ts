import * as z from "zod"

export const campaignStageSchema = z.enum(["screening", "rejectedForCampaign", "approvedForCampaign", "queuedForTesting", "errorInTestingQueue", "testing", "testingComplete", "running", "paused", "complete"])
