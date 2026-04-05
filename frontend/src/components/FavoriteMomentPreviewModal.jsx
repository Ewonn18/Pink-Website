import { API_BASE } from "../data/siteContent";
import { ghostButtonStyle } from "../styles/ui";

export default function FavoriteMomentPreviewModal({ item, onClose }) {
  if (!item) return null;

  const imageSrc = item.imageUrl ? `${API_BASE}${item.imageUrl}` : "";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        background: "rgba(8,0,6,0.84)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="moment-modal-card"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(760px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(60,0,30,0.97) 0%, rgba(28,0,16,0.98) 100%)",
          boxShadow: "0 20px 44px rgba(0,0,0,0.40)",
          backdropFilter: "blur(12px)",
          padding: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginBottom: "14px",
          }}
        >
          <div>
            <p style={quoteLabelStyle}>favorite moment</p>
            <h3
              style={{
                margin: "8px 0 0",
                color: "#ffe8f1",
                fontSize: "26px",
                lineHeight: 1.15,
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                color: "#fff0f6",
                lineHeight: 1.8,
                fontSize: "15px",
              }}
            >
              {item.caption}
            </p>
          </div>

          <button onClick={onClose} style={ghostButtonStyle}>
            Close
          </button>
        </div>

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.title}
            style={{
              width: "100%",
              maxHeight: "72vh",
              objectFit: "contain",
              borderRadius: "18px",
              display: "block",
              background: "rgba(0,0,0,0.20)",
            }}
          />
        ) : (
          <div style={momentFallbackStyle}>♡</div>
        )}
      </div>
    </div>
  );
}

const quoteLabelStyle = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#ffd2e4",
};

const momentFallbackStyle = {
  width: "100%",
  aspectRatio: "4 / 3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffd8e7",
  fontSize: "28px",
};
