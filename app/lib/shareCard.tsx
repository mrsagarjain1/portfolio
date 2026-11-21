import { ImageResponse } from "next/og";

import { metrics, seo, site } from "./content";

/**
 * The image shown when the site is shared (link previews on LinkedIn, X,
 * WhatsApp and so on). Built from the content file at build time, so the
 * numbers and roles on it can never drift from the site.
 *
 * Server only. Used by app/opengraph-image.tsx and app/twitter-image.tsx.
 */

const WIDTH = 1200;
const HEIGHT = 630;

/** Fixed node positions for the decorative network on the right side. */
const NODES: [number, number][] = [
  [90, 120], [210, 60], [330, 150], [450, 80], [150, 260], [290, 300],
  [420, 250], [520, 340], [80, 430], [220, 480], [360, 420], [480, 520],
  [160, 580], [330, 570],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [0, 4], [1, 4], [2, 5], [4, 5], [5, 6], [3, 6],
  [6, 7], [4, 8], [5, 9], [8, 9], [9, 10], [5, 10], [10, 11], [7, 11],
  [9, 12], [10, 13], [12, 13],
];

export function renderShareCard(): ImageResponse {
  const stats = [
    { value: metrics.users, label: "users" },
    { value: metrics.impressions, label: "monthly impressions" },
    { value: metrics.androidDownloads, label: "android downloads" },
    { value: metrics.iosDownloads, label: "iOS downloads" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#050508",
          color: "#e8e8e8",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: WIDTH,
            height: HEIGHT,
            display: "flex",
            background:
              "radial-gradient(circle at 78% 22%, rgba(110,231,183,0.20) 0%, rgba(110,231,183,0) 48%)",
          }}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={560}
          height={HEIGHT}
          viewBox="0 0 560 630"
          style={{ position: "absolute", right: 0, top: 0 }}
        >
          {EDGES.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a][0]}
              y1={NODES[a][1]}
              x2={NODES[b][0]}
              y2={NODES[b][1]}
              stroke="#6ee7b7"
              strokeOpacity={0.28}
              strokeWidth={1.5}
            />
          ))}
          {NODES.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 3 === 0 ? 7 : 4.5}
              fill="#6ee7b7"
              fillOpacity={i % 3 === 0 ? 0.9 : 0.55}
            />
          ))}
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 88px",
            width: 860,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 112,
              lineHeight: 1,
              letterSpacing: -3,
              color: "#ffffff",
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 44,
              color: "#6ee7b7",
            }}
          >
            Applied AI Engineer
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 30,
              fontSize: 29,
              color: "#b5b5b5",
            }}
          >
            {seo.shareCardRoles.map((role) => (
              <div key={role} style={{ display: "flex", marginTop: 6 }}>
                {role}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 46 }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginRight: 44,
                }}
              >
                <div style={{ display: "flex", fontSize: 50, color: "#e8e8e8" }}>
                  {stat.value}
                </div>
                {/* One word per line, so four stats fit in the row beside the network. */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontSize: 22,
                    color: "#8a8a8a",
                  }}
                >
                  {stat.label.split(" ").map((word) => (
                    <div key={word} style={{ display: "flex" }}>
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 44,
              fontSize: 26,
              color: "#6ee7b7",
            }}
          >
            {site.url.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
