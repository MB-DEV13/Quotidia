import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Quotidia — Ton quotidien, en mieux.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5B5EA6 0%, #9B72CF 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cercles décoratifs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        {/* Logo + nom */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <span style={{ fontSize: "64px" }}>🌀</span>
          <span style={{ fontSize: "56px", fontWeight: 800, color: "white", letterSpacing: "-2px" }}>
            Quotidia
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.85)",
            margin: "0 0 48px 0",
            textAlign: "center",
            fontWeight: 400,
          }}
        >
          Ton quotidien, en mieux.
        </p>

        {/* Pills features */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {["✅ Habitudes", "💰 Budget", "🎯 Objectifs", "🤖 Assistant IA", "🏆 Gamification"].map(
            (item) => (
              <div
                key={item}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: "100px",
                  padding: "10px 22px",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: 500,
                }}
              >
                {item}
              </div>
            )
          )}
        </div>

        {/* URL */}
        <p
          style={{
            position: "absolute",
            bottom: "28px",
            right: "40px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "18px",
          }}
        >
          myquotidia.app
        </p>
      </div>
    ),
    { ...size }
  );
}
