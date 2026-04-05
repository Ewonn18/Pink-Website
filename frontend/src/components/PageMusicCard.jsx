import { pageMusic } from "../data/siteContent";
import useWindowWidth from "../hooks/useWindowWidth";
import {
  ghostButtonStyle,
  primaryButtonStyle,
  glassPanelStyle,
  smallBadgeStyle,
} from "../styles/ui";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function PageMusicCard({
  currentPage,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  audioError,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
}) {
  const track = pageMusic[currentPage];
  const windowWidth = useWindowWidth();

  if (!track) return null;

  const isNarrow = windowWidth < 480;

  return (
    <div
      style={{
        ...glassPanelStyle,
        borderRadius: "28px",
        padding: isNarrow ? "22px" : "24px",
      }}
    >
      <div
        style={{
          ...smallBadgeStyle,
          color: "#ffd8e7",
        }}
      >
        Music for this page
      </div>

      <div style={{ marginTop: "14px", textAlign: "center" }}>
        <h3
          style={{
            margin: 0,
            fontSize: isNarrow ? "24px" : "28px",
            fontWeight: 900,
            color: "#ffe8f1",
            lineHeight: 1.1,
          }}
        >
          {track.title}
        </h3>

        <p
          style={{
            marginTop: "8px",
            color: "#ffd8e7",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: 1.7,
          }}
        >
          {track.subtitle}
        </p>
      </div>

      <div
        style={{
          marginTop: "22px",
          borderRadius: "22px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.05)",
          padding: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button onClick={onTogglePlay} style={primaryButtonStyle}>
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button onClick={onToggleMute} style={ghostButtonStyle}>
            {isMuted || volume === 0 ? "Unmute" : "Mute"}
          </button>
        </div>

        <div style={{ marginTop: "18px" }}>
          <div
            style={{
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={smallLabelStyle}>Progress</span>
            <span style={smallTimeStyle}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={onSeek}
            style={rangeStyle}
          />
        </div>

        <div style={{ marginTop: "18px" }}>
          <div
            style={{
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={smallLabelStyle}>Volume</span>
            <span style={smallTimeStyle}>{Math.round(volume * 100)}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={onVolumeChange}
            style={rangeStyle}
          />
        </div>
      </div>

      {audioError ? (
        <p
          style={{
            marginTop: "14px",
            textAlign: "center",
            color: "#ffd1d1",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          {audioError}
        </p>
      ) : null}

      <div
        style={{
          marginTop: "18px",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          padding: "18px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#fff0f6",
            lineHeight: 1.85,
            fontSize: "15px",
            textAlign: "center",
          }}
        >
          {track.line1}
        </p>

        <p
          style={{
            margin: "12px 0 0",
            color: "#ffe0ec",
            lineHeight: 1.8,
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {track.line2}
        </p>
      </div>

      <div
        style={{
          marginTop: "16px",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
          padding: "16px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#ffd2e4",
            textAlign: "center",
          }}
        >
          verse for this page
        </p>

        <p
          style={{
            margin: "10px 0 0",
            fontSize: "14px",
            lineHeight: 1.75,
            color: "#ffe7f1",
            textAlign: "center",
          }}
        >
          {track.quote}
        </p>
      </div>
    </div>
  );
}

const smallLabelStyle = {
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#ffd2e4",
};

const smallTimeStyle = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#ffe4ee",
};

const rangeStyle = {
  width: "100%",
};
