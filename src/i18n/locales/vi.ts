import broadcastCenter from "./vi/broadcast-center.json"
import broadcast from "./vi/broadcast.json"
import chat from "./vi/chat.json"
import common from "./vi/common.json"
import footer from "./vi/footer.json"
import header from "./vi/header.json"
import home from "./vi/home.json"
import live from "./vi/live.json"
import match from "./vi/match.json"
import news from "./vi/news.json"
import profile from "./vi/profile.json"
import schedule from "./vi/schedule.json"
import search from "./vi/search.json"
import video from "./vi/video.json"

const vi = {
  common,
  header,
  footer,
  home,
  match,
  news,
  schedule,
  search,
  chat,
  video,
  profile,
  broadcast,
  "broadcast-center": broadcastCenter,
  live,
} as const

export default vi

export type Dictionary = typeof vi
