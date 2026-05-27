import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "Kelly Files: Guess who is a good boy?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Load the shayla picture as a data URL so the OG renderer can embed it.
  let shaylaSrc = "";
  try {
    const buf = readFileSync(path.join(process.cwd(), "public", "shayla.png"));
    shaylaSrc = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    // graceful fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #05040a 0%, #120512 50%, #000000 100%)",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "white",
        }}
      >
        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(255, 0, 127, 0.35)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(234, 255, 0, 0.22)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />

        {/* Content layout */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "60px 70px",
            width: "100%",
            height: "100%",
            position: "relative",
            gap: 50,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 22,
                letterSpacing: "0.4em",
                color: "#eaff00",
                fontWeight: 800,
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              The Kelly Files
            </div>
            <div
              style={{
                fontSize: 78,
                lineHeight: 1.05,
                fontWeight: 900,
                display: "flex",
                background:
                  "linear-gradient(90deg, #ffffff 0%, #ff007f 50%, #eaff00 100%)",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              Guess who is a good boy?
            </div>
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 600,
                marginTop: 12,
                display: "flex",
              }}
            >
              🐶 roof roof roof · 464 graduation pictures inside
            </div>
            <div
              style={{
                marginTop: 20,
                fontSize: 18,
                color: "rgba(255,255,255,0.45)",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Mathew × Kelly · Graduation 2026
            </div>
          </div>

          {shaylaSrc && (
            <div
              style={{
                width: 340,
                height: 340,
                borderRadius: "50%",
                overflow: "hidden",
                border: "8px solid #eaff00",
                boxShadow: "0 0 80px rgba(255, 0, 127, 0.55)",
                display: "flex",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img
                src={shaylaSrc}
                width={340}
                height={340}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
