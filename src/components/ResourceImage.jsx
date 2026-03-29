import { useState } from "react";
import { getYouTubeThumbnail, getFaviconUrl } from "../lib/utils";

export function YouTubeThumbnail({ url, view }) {
  const [error, setError] = useState(false);
  const thumb = getYouTubeThumbnail(url);

  if (!thumb || error) return null;

  const isGrid = view === "grid";

  return (
    <div
      style={{
        width: isGrid ? "calc(100% + 40px)" : 120,
        height: isGrid ? 160 : 68,
        margin: isGrid ? "-20px -20px 12px -20px" : 0,
        borderRadius: isGrid ? "10px 10px 0 0" : 6,
        overflow: "hidden",
        flexShrink: 0,
        background: "#f5f0eb",
      }}
    >
      <img
        src={thumb}
        alt=""
        loading="lazy"
        onError={() => setError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}

export function Favicon({ url, size = 16 }) {
  const [error, setError] = useState(false);
  const favicon = getFaviconUrl(url, size * 2); // fetch 2x for retina

  if (!favicon || error) return null;

  return (
    <img
      src={favicon}
      alt=""
      loading="lazy"
      onError={() => setError(true)}
      style={{
        width: size,
        height: size,
        marginRight: 6,
        verticalAlign: "middle",
        borderRadius: 2,
        flexShrink: 0,
      }}
    />
  );
}
