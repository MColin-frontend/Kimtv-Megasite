import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "KimTV — Bóng đá trực tiếp"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #070f1e 0%, #0d1f3c 50%, #091320 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(246,195,67,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 28 }}>
          <img
            src="https://kimtv.net/icon.png"
            width={100}
            height={100}
            style={{ borderRadius: 20 }}
            alt=""
          />
          <span
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: "#f6c343",
              letterSpacing: "-2px",
              textShadow: "0 0 40px rgba(246,195,67,0.5)",
            }}
          >
            KimTV
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            margin: 0,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Xem bóng đá trực tiếp · Tỉ số online · Highlight thể thao
        </p>

        {/* URL bar */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(255,255,255,0.4)",
            fontSize: 22,
          }}
        >
          <span>kimtv.net</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
