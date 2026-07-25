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
import video from "./vi/video.json"

const vi = {
  common,
  header,
  footer,
  home,
  match,
  news,
  schedule,
  chat,
  video,
  profile,
  broadcast,
  broadcastCenter,
  live,
}

export default vi

export interface Dictionary {
  common: {
    yesterday: string
    today: string
    tomorrow: string
    empty: string
    "live-page": {
      "live-section": string
      "upcoming-section": string
      "finished-section": string
      "filter-all": string
      "filter-hot": string
      "filter-live": string
      "filter-tv": string
    }
    "user-info": {
      tabs: { all: string; news: string; video: string }
      stats: {
        articles: string
        videos: string
        followers: string
        joined: string
        joinedSuffix: string
      }
      follow: string
      following: string
      hotNews: string
      empty: string
      category: string
      readMore: string
      video: string
      fallbackBio1: string
      fallbackBio2: string
    }
  }
  match: {
    card: {
      hours: string
      minutes: string
      seconds: string
      finished: string
      "watch-preview": string
      "blv-label": string
      "stream-label": string
      "live-label": string
      watching: string
      "watching-tooltip": string
      period: {
        h1: string
        ht: string
        h2: string
        et: string
        pen: string
        live: string
      }
      stats: {
        shots: string
        "yellow-card": string
        "red-card": string
        corner: string
      }
    }
    fixture: {
      league: string
      match: string
      time: string
      score: string
      "corner-kick": string
      "yellow-card": string
      "red-card": string
      empty: string
    }
  }
  header: {
    nav: {
      home: string
      schedule: string
      "live-score": string
      "live-schedule": string
      results: string
      standings: string
      news: string
      video: string
      highlight: string
      data: string
    }
    auth: {
      login: string
      register: string
      callback: {
        processing: string
        error: string
      }
    }
    search: {
      "aria-label": string
      placeholder: string
    }
    user: {
      "aria-label": string
      account: string
      "fallback-name": string
      menu: {
        broadcast: string
        profile: string
        settings: string
      }
      logout: {
        label: string
        title: string
        content: string
        confirm: string
        cancel: string
      }
    }
    "mobile-menu": {
      open: string
      close: string
    }
  }
  footer: {
    desc: string
    menu: {
      home: string
      fixtures: string
      "live-score": string
      news: string
      highlights: string
    }
    copyright: string
  }
  home: {
    status: {
      all: string
      live: string
      finished: string
    }
    hero: {
      alt: string
    }
    "match-schedule": {
      title: string
    }
    "league-select": {
      all: string
      unit: string
      title: string
      selected: string
      "clear-all": string
      "search-placeholder": string
      empty: string
      favorites: string
    }
  }
  news: {
    title: string
    "page-title": string
    latest: string
    popular: string
    category: string
    "view-all": string
    empty: string
    subtitle: string
    "read-more": string
    "back-to-list": string
    "published-by": string
    "hot-videos": string
    author: {
      follow: string
      following: string
    }
    comment: {
      title: string
      placeholder: string
      reply: string
      delete: string
      submit: string
      empty: string
      "login-to-comment": string
      "view-more": string
    }
  }
  chat: {
    connecting: string
    connected: string
    disconnected: string
    reconnecting: string
    reconnect: string
    "new-messages": string
    placeholder: string
    login: string
    "login-prompt": string
    welcome: string
    "pin-label": string
    role: { streamer: string; admin: string }
    report: {
      title: string
      submit: string
      types: {
        speech: string
        attack: string
        nickname: string
        ad: string
        avatar: string
        spam: string
      }
    }
    actions: {
      "ban-all": string
      "ban-room": string
      delete: string
      pin: string
      unpin: string
      "set-manager": string
    }
    "login-to-chat": string
    "empty-message": string
    cancel: string
  }
  schedule: {
    "page-title": string
    subtitle: string
    "latest-news": string
    "header-suffix": string
    "header-desc": string
  }
  video: {
    title: string
    "no-source": { title: string; description: string }
    menu: { featured: string; latest: string; trending: string; news: string; promotion: string }
    actions: {
      like: string
      comment: string
      share: string
      follow: string
      mute: string
      unmute: string
      play: string
      pause: string
      replay: string
    }
    share: { copied: string }
    follow: { success: string }
    comment: {
      title: string
      placeholder: string
      submit: string
      "login-prompt": string
      empty: string
      "load-more": string
      posting: string
      reply: string
      delete: string
      "post-success": string
      "reply-success": string
      "post-error": string
      "delete-success": string
      "delete-error": string
    }
    empty: string
    "load-more": string
    seo: { title: string; description: string }
  }
  profile: {
    pageTitle: string
    subtitle: string
    loginPrompt: string
    loginButton: string
    emptyTab: string
    nav: { profile: string; myNews: string; favorites: string; following: string; settings: string }
    info: {
      title: string
      editProfile: string
      phone: string
      email: string
      password: string
      change: string
      save: string
      cancel: string
      saving: string
      saveSuccess: string
      saveError: string
    }
    preferences: { title: string; addMore: string }
    security: { title: string; changeLink: string; changePassword: string }
  }
  broadcast: {
    registration: {
      title: string
      description: string
      benefit1: string
      benefit2: string
      benefit3: string
      cta: string
      form: {
        sectionInfo: string
        sectionId: string
        sectionIdHint: string
        name: string
        namePlaceholder: string
        phone: string
        phonePlaceholder: string
        idNumber: string
        idNumberPlaceholder: string
        brief: string
        briefPlaceholder: string
        idFront: string
        idBack: string
        idHolding: string
        submit: string
        tip: string
        successTitle: string
        successDesc: string
        backHome: string
      }
    }
    hero: { fallbackName: string; role: string; subtitle: string; channel: string }
    rules: {
      title: string
      description: string
      item0: string
      item1: string
      item2: string
      item3: string
      item4: string
      item5: string
      item6: string
      item7: string
      item8: string
    }
    streamPanel: {
      title: string
      refresh: string
      refreshSuccess: string
      fields: { rtmpUrl: string; streamKey: string; liveUrlHls: string; liveUrlFlv: string }
    }
    guide: {
      button: string
      title: string
      subtitle: string
      notice: string
      steps: { step1: string; step2: string; step3: string; step4: string }
    }
    roomOwner: {
      title: string
      subtitle: string
      fields: {
        intro: { label: string; placeholder: string; error: string }
        introDetail: { label: string; placeholder: string; error: string }
        images: { label: string; error: string }
        announcement: { label: string; placeholder: string; error: string }
      }
      actions: { cancel: string; save: string }
      preview: {
        noIntro: string
        introDetail: string
        images: string
        announcement: string
        edit: string
        label: string
      }
    }
    streamSettings: {
      title: string
      status: { idle: string }
      liveId: string
      ownerInfo: { subtitle: string }
      admin: { label: string; empty: string }
      fields: {
        title: { label: string; placeholder: string; error: string; maxLength: string }
        cover: { label: string; hint: string }
        scheduled: { label: string }
        scheduledAt: { label: string; placeholder: string; error: string }
        liveMode: { label: string }
        sport: { label: string; placeholder: string }
        league: { placeholder: string; error: string }
        match: { label: string; placeholder: string; error: string }
        matchStatus: { label: string }
        streamType: { label: string }
        loginRequired: { label: string }
        externalComment: { label: string }
        m3u8Url: { label: string; placeholder: string }
      }
      options: {
        yes: string
        no: string
        liveMode: { match: string; free: string }
        sport: {
          soccer: string
          basketball: string
          tennis: string
          volleyball: string
          tableTennis: string
          badminton: string
          snooker: string
          baseball: string
          football: string
          cricket: string
        }
        liveStatus: { live: string }
        matchStatus: {
          upcoming: string
          live: string
          finished: string
          cancelled: string
          postponed: string
        }
        streamType: { host: string; anchor: string; bot: string }
        loginRequired: { no: string; yes: string; coin: string; level: string }
        externalComment: { none: string; connected: string }
        customType: { customLive: string }
      }
      bannedUsers: { label: string; view: string }
      actions: {
        cancel: string
        confirm: string
        edit: string
        startStream: string
        startStreamSuccess: string
        endStream: string
        endStreamSuccess: string
        cancelReservation: string
        cancelReservationConfirm: string
      }
    }
  }
  live: {
    poll: {
      title: string
      subtitle: string
      type: {
        label: string
        single: string
        singleDesc: string
        multiple: string
        multipleDesc: string
        rating: string
        ratingDesc: string
      }
      steps: {
        question: string
        options: string
        minMax: string
        ratingScale: string
        duration: string
      }
      placeholder: { question: string; option: string; duration: string; customDuration: string }
      labels: {
        minutes: string
        seconds: string
        minSelect: string
        maxSelect: string
        minRating: string
        maxRating: string
        optionCount: string
        addOption: string
        optionHint: string
        customDuration: string
        maxDuration: string
        totalVotes: string
        hintSingle: string
        hintMultiple: string
        shareTitle: string
        votes: string
      }
      actions: {
        addOption: string
        cancel: string
        submit: string
        end: string
        vote: string
        voted: string
        viewResult: string
      }
      errors: {
        questionRequired: string
        questionMax: string
        optionRequired: string
        optionsMin: string
        durationRequired: string
        durationPositive: string
        minSelectRequired: string
        maxSelectRequired: string
        maxSelectGteMin: string
        maxSelectExceed: string
      }
      status: { active: string; ended: string; votes: string }
    }
  }
  broadcastCenter: {
    title: string
    sectionManage: string
    joinNow: string
    menu: {
      registration: string
      settings: string
      reservation: string
      commentator: string
      channel: string
      history: string
      guide: string
      faq: string
      support: string
      social: string
    }
    empty: string
    reservation: {
      activeTitle: string
      formTitle: string
      book: string
      booked: string
      streamTitle: string
      scheduledAt: string
      cancel: string
      submit: string
      selectMatchHint: string
      changeMatch: string
    }
  }
}
