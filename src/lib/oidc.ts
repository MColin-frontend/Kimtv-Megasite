"use client"

const SSO_PORTAL_URL = "https://identity.99kim.llc"
const OIDC_SCOPE = "openid profile email phone offline_access"
const ID_TOKEN_REFRESH_BUFFER_SEC = 90
const DEFAULT_AUTH_PORTAL_URL = "https://auth.99kim.llc"

const OIDC_CLIENT_ID = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || "kimtv-web"
const USE_AUTH_PORTAL = process.env.NEXT_PUBLIC_OIDC_USE_AUTH_PORTAL !== "false"
const AUTH_PORTAL_URL = process.env.NEXT_PUBLIC_OIDC_AUTH_PORTAL_URL || DEFAULT_AUTH_PORTAL_URL

function getAppOrigin(): string {
  // Luôn dùng origin thực của trình duyệt (kimtv.net trên prod, localhost:3000 khi dev).
  // KHÔNG dùng NEXT_PUBLIC_APP_URL vì biến đó được inline lúc build và sẽ sai
  // khi deploy lên domain khác với domain đã build.
  if (typeof window !== "undefined") return window.location.origin
  return "http://localhost:3000"
}

function isEndSessionUrl(url: string): boolean {
  return /\/connect\/(?:end_?session|logout)/i.test(url)
}

function buildAuthPortalLoginUrl(authorizeUrl: string): string {
  const portal = AUTH_PORTAL_URL.replace(/\/$/, "")
  return `${portal}/?returnUrl=${encodeURIComponent(authorizeUrl)}`
}

function createAuthPortalRedirectNavigator() {
  if (!USE_AUTH_PORTAL) return undefined

  return {
    async prepare() {
      return {
        async navigate({ url }: { url: string }) {
          const targetUrl = isEndSessionUrl(url) ? url : buildAuthPortalLoginUrl(url)
          return new Promise<string>((resolve, reject) => {
            const onPageShow = () => resolve(window.location.href)
            window.addEventListener("pageshow", onPageShow, { once: true })
            try {
              window.location.assign(targetUrl)
            } catch (error) {
              window.removeEventListener("pageshow", onPageShow)
              reject(error)
            }
          })
        },
        close() {},
      }
    },
    async callback() {},
  }
}

let managerPromise: Promise<import("oidc-client-ts").UserManager> | null = null
let silentRenewPromise: Promise<import("oidc-client-ts").User | null> | null = null
let metadataPromise: Promise<unknown> | null = null

export function getOidcMetadataUrl(): string {
  return `${SSO_PORTAL_URL.replace(/\/$/, "")}/.well-known/openid-configuration`
}

export async function fetchOidcMetadata(): Promise<unknown> {
  if (typeof window === "undefined") throw new Error("fetchOidcMetadata: client only")

  if (!metadataPromise) {
    metadataPromise = fetch(getOidcMetadataUrl())
      .then(async (res) => {
        if (!res.ok) throw new Error(`OIDC config request failed (${res.status})`)
        const metadata = await res.json()
        if (!metadata?.authorization_endpoint)
          throw new Error("OIDC config missing authorization_endpoint")
        return metadata
      })
      .catch((err) => {
        metadataPromise = null
        throw err
      })
  }

  return metadataPromise
}

export async function getUserManager(): Promise<import("oidc-client-ts").UserManager> {
  if (typeof window === "undefined") throw new Error("getUserManager: client only")

  if (!managerPromise) {
    managerPromise = import("oidc-client-ts").then(({ UserManager, WebStorageStateStore }) => {
      const origin = getAppOrigin()
      const redirectNavigator = createAuthPortalRedirectNavigator()

      const manager = new UserManager(
        {
          authority: SSO_PORTAL_URL,
          client_id: OIDC_CLIENT_ID,
          redirect_uri: `${origin}/callback`,
          silent_redirect_uri: `${origin}/silent-callback`,
          post_logout_redirect_uri: `${origin}/`,
          response_type: "code",
          scope: OIDC_SCOPE,
          automaticSilentRenew: true,
          loadUserInfo: true,
          userStore: new WebStorageStateStore({ store: window.localStorage }),
        },
        redirectNavigator as never
      )
      manager.startSilentRenew()
      return manager
    })
  }

  return managerPromise
}

export async function loginWith99kim(): Promise<void> {
  if (!OIDC_CLIENT_ID) throw new Error("OIDC client_id is not configured")
  await fetchOidcMetadata()
  const um = await getUserManager()
  return um.signinRedirect()
}

export async function signinRedirectCallback() {
  const um = await getUserManager()
  return um.signinRedirectCallback()
}

export async function signinSilentCallback() {
  const um = await getUserManager()
  return um.signinSilentCallback()
}

export async function getValidIdToken(
  options: { forceRefresh?: boolean } = {}
): Promise<string | null> {
  if (typeof window === "undefined") return null

  const um = await getUserManager()
  let user = await um.getUser()
  if (!user) return null

  const now = Date.now() / 1000
  const exp = user.expires_at ?? 0
  const needsRenew =
    Boolean(options.forceRefresh) ||
    user.expired ||
    !exp ||
    exp - ID_TOKEN_REFRESH_BUFFER_SEC <= now

  if (needsRenew) {
    if (!silentRenewPromise) {
      silentRenewPromise = um
        .signinSilent()
        .catch(() => null)
        .finally(() => {
          silentRenewPromise = null
        })
    }
    const renewed = await silentRenewPromise
    user = renewed ?? (await um.getUser())
  }

  const idToken = user?.id_token
  if (!idToken || user?.expired) return null
  return idToken
}

export async function logoutFrom99kim(): Promise<void> {
  const um = await getUserManager()
  return um.signoutRedirect()
}
