import { API_BASE } from "../data/siteContent";

function normalizeUrl(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim();
}

function buildMediaUrl(value) {
  const raw = normalizeUrl(value);
  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return `${API_BASE}${raw}`;
  }

  return `${API_BASE}/${raw}`;
}

function getMomentImageUrl(item) {
  if (!item || typeof item !== "object") return "";

  const possibleUrl =
    item.imageUrl ||
    item.fileUrl ||
    item.mediaUrl ||
    item.cloudinaryUrl ||
    item.url ||
    item.secure_url ||
    item.assetUrl ||
    item.previewUrl ||
    item?.asset?.url ||
    item?.asset?.secure_url ||
    "";

  return buildMediaUrl(possibleUrl);
}

export default function FavoriteMomentCard({ item, onOpen }) {
  const imageSrc = getMomentImageUrl(item);

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      style={momentCardButtonStyle}
    >
      <div style={momentCardStyle}>
        <div style={momentImageWrapStyle}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.title || "Favorite moment"}
              style={momentImageStyle}
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback = event.currentTarget.nextSibling;
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          ) : null}

          <div
            style={{
              ...momentFallbackStyle,
              display: imageSrc ? "none" : "flex",
            }}
          >
            ♡
          </div>
        </div>

        <div style={{ marginTop: "14px" }}>
          <p style={momentTitleStyle}>{item.title}</p>
          <p style={momentCaptionStyle}>{item.caption}</p>
        </div>

        <div style={momentHintStyle}>Tap to open</div>
      </div>
    </button>
  );
}

const momentCardButtonStyle = {
  border: "none",
  padding: 0,
  background: "transparent",
  textAlign: "left",
  cursor: "pointer",
};

const momentCardStyle = {
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.10)",
  background:
    "linear-gradient(180deg, rgba(54,0,26,0.72) 0%, rgba(24,0,14,0.82) 100%)",
  padding: "14px",
  height: "100%",
  boxShadow: "0 14px 30px rgba(42,0,20,0.26)",
};

const momentImageWrapStyle = {
  width: "100%",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  position: "relative",
};

const momentImageStyle = {
  width: "100%",
  aspectRatio: "4 / 3",
  objectFit: "cover",
  display: "block",
};

const momentFallbackStyle = {
  width: "100%",
  aspectRatio: "4 / 3",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffd8e7",
  fontSize: "28px",
  background: "rgba(255,255,255,0.03)",
};

const momentTitleStyle = {
  margin: 0,
  color: "#ffe8f1",
  fontSize: "16px",
  fontWeight: 800,
  lineHeight: 1.3,
};

const momentCaptionStyle = {
  margin: "8px 0 0",
  color: "#fff0f6",
  fontSize: "14px",
  lineHeight: 1.7,
};

const momentHintStyle = {
  marginTop: "12px",
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#ffe7f1",
  fontSize: "12px",
  fontWeight: 700,
};
