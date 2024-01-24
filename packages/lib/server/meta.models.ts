export type MetaVidViewsEvent =
  | "video_watched"
  | "video_view_15s"
  | "video_view_25_percent"
  | "video_view_50_percent"
  | "video_view_75_percent"
  | "video_completed";

export interface MetaVidViewsRule {
  object_id: string;
  event_name: MetaVidViewsEvent;
}

export interface MetaVidViewsAudienceParams {
  name: string;
  subtype: "ENGAGEMENT";
  description: string;
  prefill: 1;
  rule: MetaVidViewsRule[];
}

export interface MetaInterestQueryResponse {
  name: string;
  id: string;
  topic: string;
  audience_size_lower_bound: number;
  audience_size_upper_bound: number;
}

export interface MetaInterestTargetOptions {
  query: string;
  interests: MetaInterestQueryResponse[];
}

export interface MetaTargeting {
  // audience //
  // demo
  age_min?: number;
  age_max?: number;
  genders?: number[];
  // geo
  geo_locations: { countries: string[] };
  // interests
  interests: string[];

  // campaign //
  publisher_platforms: ("facebook" | "instagram")[];
  facebook_positions?: ("feed" | "video_feeds" | "marketplace")[];
  instagram_positions?: ("stream" | "story" | "reels")[];
}

export type MetaStatus = "ACTIVE" | "PAUSED";

export interface Meta_Ad_Set_Params {
  name: string;
  campaign_id: string;
  optimization_goal: "THRUPLAY" | "LANDING_PAGE_VIEWS";
  billing_event: "IMPRESSIONS";
  bid_strategy: "LOWEST_COST_WITHOUT_CAP";
  promoted_object?:
    | { page_id: string }
    | { pixel_id: string; custom_event_type: "CONTENT_VIEW" };
  daily_budget: number;
  targeting: MetaTargeting;
  status?: MetaStatus;
}

export interface Meta_Ad_Creative_Params {
  name: string;
  object_type: "VIDEO";
  object_story_spec: {
    page_id?: string; //fb page
    instagram_actor_id?: string;

    video_data?: {
      call_to_action?: {
        type: "LISTEN_NOW";
        value: {
          link: string;
          link_caption: "open.spotify.com";
        };
      };
      video_id: string;
      message?: string;
      image_url?: string;
    };
  };
  url_tags?: string;
}

export interface Meta_Ad_Creative_Fields {
  id: string;
  name: string;
  // fb
  actor_id: string;
  effective_object_story_id: string;
  // ig
  instagram_user_id: string;
  effective_instagram_story_id: string;
  effective_instagram_media_id: string;
  //
  call_to_action_type: string;
}

export interface Meta_Ad_Params {
  name: string;
  adset_id: string;
  creative: { creative_id?: string };
  status: MetaStatus;
  tracking_specs?: { "action.type": "offsite_conversion"; fb_pixel?: string };
}
