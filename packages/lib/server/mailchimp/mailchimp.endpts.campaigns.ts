// import {z} from 'zod';

// async function getMailchimpCampaigns  ({accessToken, server}: {accessToken: string, server: string}) {
//     const endpoint = `https://${server}.api.mailchimp.com/3.0/campaigns`;

// }

// // schema

// const getMailchimpCampaignsSchema = z.object({
//     total_items: z.number(),
//     campaigns: z.array(z.object({
//         id: z.string(),
//         web_id: z.number(),
//         parent_campaign_id: z.string().nullable(),
//         type: z.enum(['regular', 'plaintext', 'absplit', 'rss', 'variate']),
//         create_time: z.string(),
//         archive_url: z.string(),
//         long_archive_url: z.string(),
//         status: z.string(),
//         emails_sent: z.number(),
//         send_time: z.string(),
//         content_type: z.string(),
//         needs_block_refresh: z.boolean(),
//         resendable: z.boolean(),
//         content_id: z.string(),
//         settings: z.object({}),
//         recipients: z.object({}),
//         tracking: z.object({}),

//         opens: z.number(),
//         clicks: z.number(),
//         bounces: z.number(),
//         unsubscribed: z.number(),
//         abuse_reports: z.number(),
//         abuse_reports_opened: z.number(),
//     })),
//     _links: z.object({}),
// })
