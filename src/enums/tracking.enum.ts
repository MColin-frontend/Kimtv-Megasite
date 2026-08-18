// ─── Event names ──────────────────────────────────────────────────────────────

export enum TrackingEventsEnum {
  // Page / Session
  PAGE_VIEW = "page_view",
  SESSION_START = "session_start",
  TIME_ON_PAGE = "time_on_page",
  PAGE_ERROR = "page_error",

  // Navigation / Layout
  LOGO_CLICKED = "logo_clicked",
  MENU_CLICKED = "menu_clicked",
  AUTH_BUTTON_CLICKED = "auth_button_clicked",
  USER_MENU_OPENED = "user_menu_opened",
  FOOTER_LINK_CLICKED = "footer_link_clicked",
  SOCIAL_CLICKED = "social_clicked",

  // Home
  HERO_MATCH_CLICKED = "hero_match_clicked",
  SIDEBAR_MATCH_CLICKED = "sidebar_match_clicked",
  DATE_TAB_CLICKED = "date_tab_clicked",
  MATCH_CARD_CLICKED = "match_card_clicked",

  // Match (Trực tiếp / Kết quả)
  DATE_PICKER_DATE_SELECTED = "date_picker_date_selected",
  FILTER_CLICKED = "filter_clicked",
  LEAGUE_CLICKED = "league_clicked",
  LEAGUE_DROPDOWN_ITEM_SELECTED = "league_dropdown_item_selected",
  MATCH_MATCH_CLICKED = "match_match_clicked",
  MATCH_WATCH_ICON_CLICKED = "match_watch_icon_clicked",

  // Match Detail
  MATCH_DETAIL_VIEWED = "match_detail_viewed",
  SHARE_CLICKED = "share_clicked",

  // Stream / Player
  STREAM_STARTED = "stream_started",
  STREAM_PAUSED = "stream_paused",
  STREAM_RESUMED = "stream_resumed",
  STREAM_PROGRESS = "stream_progress",
  STREAM_ENDED_BY_USER = "stream_ended_by_user",
  STREAM_SOURCE_CHANGED = "stream_source_changed",
  STREAM_SERVER_CHANGED = "stream_server_changed",
  STREAM_FULLSCREEN_TOGGLED = "stream_fullscreen_toggled",
  STREAM_BUFFERING = "stream_buffering",
  STREAM_ERROR = "stream_error",
  STREAM_RECOVERED = "stream_recovered",
  PLAYER_MODE_CHANGED = "player_mode_changed",

  // Chat
  CHAT_LOGIN_REQUIRED_SHOWN = "chat_login_required_shown",
  CHAT_MESSAGE_SENT = "chat_message_sent",
  CHAT_MESSAGE_FAILED = "chat_message_failed",
  CHAT_SLOW_MODE_BLOCKED = "chat_slow_mode_blocked",
  CHAT_URL_CLICKED = "chat_url_clicked",
  CHAT_SCROLL_PAUSED = "chat_scroll_paused",
  CHAT_SCROLL_TO_LATEST = "chat_scroll_to_latest",
  CHAT_MESSAGE_PINNED = "chat_message_pinned",
  CHAT_PINNED_BANNER_CLICKED = "chat_pinned_banner_clicked",
  CHAT_DISCONNECTED = "chat_disconnected",

  // News / Highlights
  NEWS_CARD_CLICKED = "news_card_clicked",
  HIGHLIGHT_CARD_CLICKED = "highlight_card_clicked",
  HIGHLIGHT_VIDEO_PLAYED = "highlight_video_played",
  HIGHLIGHT_VIDEO_PROGRESS = "highlight_video_progress",

  // Search
  SEARCH_INITIATED = "search_initiated",
  SEARCH_SUBMITTED = "search_submitted",
  SEARCH_RESULTS_VIEWED = "search_results_viewed",
  SEARCH_RESULT_CLICKED = "search_result_clicked",

  // Auth
  SIGNUP_STARTED = "signup_started",
  SIGNUP_SUBMITTED = "signup_submitted",
  SIGNUP_SUCCEEDED = "signup_succeeded",
  SIGNUP_FAILED = "signup_failed",
  LOGIN_SUBMITTED = "login_submitted",
  LOGIN_SUCCEEDED = "login_succeeded",
  LOGIN_FAILED = "login_failed",
  LOGOUT_CLICKED = "logout_clicked",

  // Ads
  AD_IMPRESSION = "ad_impression",
  AD_CLICKED = "ad_clicked",
  AD_CLOSED = "ad_closed",
  VIDEO_AD_COMPLETED = "video_ad_completed",

  // Performance / Errors
  WEB_VITAL_MEASURED = "web_vital_measured",
  JS_ERROR = "js_error",
  API_FAILED = "api_failed",
}

// ─── Payload keys ─────────────────────────────────────────────────────────────

export enum TrackingPayloadKeyEnum {
  USER_ID = "user_id",
  ANONYMOUS_ID = "anonymous_id",
  SESSION_ID = "session_id",
  EVENT_TYPE = "event_type",
  EVENT_ID = "event_id",
  LIVE_ROOM_ID = "live_room_id",
  ROOM_ID = "room_id",
  SOURCE_LINK = "source_link",
  TARGET_LINK = "target_link",
  SESSION_DURATION = "session_duration",
  SESSION_START_TIME = "session_start_time",
  SESSION_END_TIME = "session_end_time",
  CTA_TYPE = "cta_type",
  CTA_CONTENT = "cta_content",
  CTA_POSITION = "cta_position",
  CTA_PLACEMENT_ID = "cta_placement_id",
  CTA_START_TIME = "cta_start_time",
  CTA_END_TIME = "cta_end_time",
  CTA_TRACKING_LINK = "cta_tracking_link",
  SUPPORTER_ID = "supporter_id",
  PROPERTIES = "properties",
  TIMESTAMP = "timestamp",
  MATCH_ID = "match_id",
  SPORT_TYPE = "sport_type",
  CONTENT = "content",
  ACTION_ID = "action_id",
  PROGRESS = "progress",
  MENU_LABEL = "menu_label",
  SELECTED_DATE = "selected_date",
  PREVIOUS_TAB = "previous_tab",
  LEAGUE_ID = "league_id",
  HOME_TEAM_ID = "home_team_id",
  HOME_TEAM_NAME = "home_team_name",
  AWAY_TEAM_ID = "away_team_id",
  AWAY_TEAM_NAME = "away_team_name",
  LEAGUE_NAME = "league_name",
  CONTENT_POSITION = "content_position",
  MATCH_STATUS = "match_status",
  KICKOFF_TIME = "kickoff_time",
  MATCH_END_TIME = "match_end_time",
  CURRENT_MINUTE = "current_minute",
  HOME_SCORE = "home_score",
  AWAY_SCORE = "away_score",
  DEVICE_TYPE = "device_type",
  PAGE_PATH = "page_path",
  PAGE_REFERRER = "page_referrer",
  TRAFFIC_SOURCE = "traffic_source",
  PLACEMENT = "placement",
  ERROR_CODE = "error_code",
  ERROR_MESSAGE = "error_message",
  AUTH_METHOD = "auth_method",
  COUNTRY = "country",
  REGION = "region",
}

// ─── Value strings ────────────────────────────────────────────────────────────

export enum TrackingValueEnum {
  // Match status
  RESULT = "result",
  UPCOMING = "upcoming",
  FINISHED = "ended",
  LIVE = "live",
  HOT = "hot",
  BROADCAST = "broadcast",
  ALL = "all",

  // CTA positions
  HOME = "home",
  DETAIL = "detail",
  HOME_HERO = "home_hero",
  HOME_TABS = "home_tabs",
  HERO = "hero",
  ANCHOR = "anchor",
  ANCHOR_HERO = "anchor_hero",
  HEADER = "header",

  // Sport type
  SOCCER = "soccer",
  BASKETBALL = "basketball",
  ESPORTS = "esports",

  // Ad / CTA
  BANNER_ADS = "banner_ads",
  TOP = "top",
  LEFT = "left",
  BOTTOM = "bottom",
  RIGHT = "right",
  SIDEBAR = "sidebar",
  MATCH_LIST = "match_list",
  LIVE_LOWER = "live_lower",
  ANCHOR_LIST = "anchor_list",
  OVERLAY = "overlay",

  // Content areas
  WHOLE_CARD = "whole_card",
  HIGHLIGHT_VIDEO = "highlight_video",
  HIGHLIGHT_VIEW = "highlight_view",
  DATE_TAB = "date_tab",
  COMMENTATOR = "commentator",

  // Auth method
  EMAIL = "email",
  PHONE = "phone",
  OIDC = "oidc",

  // Card element areas — dùng trong data-tracking-area + CTA_CONTENT
  // Giống PC TrackingValueEnums (MatchCard.vue data-tracking-area attributes)
  LIVE_BADGE = "live_badge",
  KICKOFF_TIMER = "kickoff_timer",
  HOME_TEAM_LOGO = "home_team_logo",
  HOME_TEAM_NAME = "home_team_name",
  AWAY_TEAM_LOGO = "away_team_logo",
  AWAY_TEAM_NAME = "away_team_name",
  MATCH_STATUS_AREA = "match_status",
  RATIO = "ratio",
  SCORE = "score",
  ANCHOR_AVATAR = "anchor_avatar",
  ANCHOR_NAME = "anchor_name",
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

export enum CtaPositionEnum {
  SIDEBAR = "sidebar",
  OVERLAY = "overlay",
  TOP = "top",
  BOTTOM = "bottom",
}

export enum CtaTypeEnum {
  BANNER_OVERLAY = "banner_overlay",
  HEADER_BANNER = "header_banner",
}

// ─── Device ───────────────────────────────────────────────────────────────────

export enum TrackingDeviceTypeEnum {
  TABLET = "Tablet",
  MOBILE = "Mobile",
  DESKTOP = "Desktop",
}

// ─── Traffic source ───────────────────────────────────────────────────────────

export enum TrackingTrafficSourceEnum {
  ORGANIC = "organic",
  SOCIAL = "social",
  REFERRAL = "referral",
  DIRECT = "direct",
}

// ─── UTM ──────────────────────────────────────────────────────────────────────

export enum TrackingUtmParamKeyEnum {
  UTM_SOURCE = "utm_source",
  UTM_MEDIUM = "utm_medium",
}

export enum TrackingUtmMediumEnum {
  ORGANIC = "organic",
  SOCIAL = "social",
  PAID_SOCIAL = "paid_social",
  CPC = "cpc",
  PPC = "ppc",
  DISPLAY = "display",
  BANNER = "banner",
  EMAIL = "email",
  REFERRAL = "referral",
}

export enum TrackingUtmSourceEnum {
  GOOGLE = "google",
  BING = "bing",
  YAHOO = "yahoo",
  FACEBOOK = "facebook",
  INSTAGRAM = "instagram",
  TIKTOK = "tiktok",
  YOUTUBE = "youtube",
  TWITTER = "twitter",
  X = "x",
}
