import { useEffect, useState } from "react";
import AnniversaryCountdown from "../components/AnniversaryCountdown";
import { API_BASE } from "../data/siteContent";
import useWindowWidth from "../hooks/useWindowWidth";
import { apiGet } from "../lib/api";
import { glassPanelStyle, smallBadgeStyle } from "../styles/ui";

function Hero({ musicCard }) {
  const windowWidth = useWindowWidth();
  const isNarrow = windowWidth < 980;

  return (
    <section
      style={{
        position: "relative",
        zIndex: 10,
        padding: "40px 16px 22px",
      }}
    >
      <div
        style={{
          ...glassPanelStyle,
          maxWidth: "1380px",
          margin: "0 auto",
          borderRadius: "36px",
          padding: isNarrow ? "24px" : "30px",
          boxShadow: "0 22px 56px rgba(72,0,32,0.24)",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "28px",
            alignItems: "center",
            gridTemplateColumns: isNarrow
              ? "1fr"
              : "minmax(0, 1.2fr) minmax(320px, 400px)",
          }}
        >
          <div>
            <div style={badgeStyle}>Made for the girl I love</div>

            <h1
              style={{
                margin: "16px 0 0",
                fontSize: isNarrow ? "40px" : "64px",
                lineHeight: isNarrow ? 1.02 : 0.95,
                fontWeight: 900,
                color: "#ffe6f0",
                maxWidth: "780px",
              }}
            >
              A soft pink space for our sweetest memories, music, and love
              story.
            </h1>

            <p
              style={{
                marginTop: "22px",
                maxWidth: "760px",
                fontSize: isNarrow ? "16px" : "18px",
                lineHeight: 1.85,
                color: "#fff0f6",
              }}
            >
              This little website is for you, my love — a place where every
              photo, every laugh, every song, and every moment we share can stay
              safe, beautiful, and remembered. No matter how many days pass, I
              want us to always have a home for our story.
            </p>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <span style={pillStyle}>Our Love Story</span>
              <span style={pillStyle}>Favorite Songs</span>
              <span style={pillStyle}>Photos and Memories</span>
            </div>

            <div style={quoteBoxStyle}>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#ffd2e4",
                }}
              >
                little reminder
              </p>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#fff0f6",
                  lineHeight: 1.85,
                  fontSize: "15px",
                }}
              >
                Every part of this page is a small way of saying that loving you
                is one of the most beautiful things my heart has ever known.
              </p>
            </div>
          </div>

          <div>{musicCard}</div>
        </div>
      </div>
    </section>
  );
}

function formatMemoryDate(value) {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value || "";
  }
}

function StatsCard({ label, value, note }) {
  return (
    <div style={statsCardStyle}>
      <p style={statsLabelStyle}>{label}</p>
      <p style={statsValueStyle}>{value}</p>
      <p style={statsNoteStyle}>{note}</p>
    </div>
  );
}

function QuickLinkCard({ title, text, page, onNavigate }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(page)}
      style={quickLinkCardStyle}
    >
      <p style={quickLinkLabelStyle}>Quick shortcut</p>
      <h3 style={quickLinkTitleStyle}>{title}</h3>
      <p style={quickLinkTextStyle}>{text}</p>
      <div style={quickLinkHintStyle}>Open page</div>
    </button>
  );
}

function LatestMemoryCard({ item, loading, error, onNavigate }) {
  if (loading) {
    return (
      <div style={dashboardPanelStyle}>
        <p style={sectionEyebrowStyle}>Latest memory</p>
        <h3 style={dashboardTitleStyle}>Loading your newest memory...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={dashboardPanelStyle}>
        <p style={sectionEyebrowStyle}>Latest memory</p>
        <h3 style={dashboardTitleStyle}>Could not load latest memory</h3>
        <p style={dashboardBodyStyle}>{error}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={dashboardPanelStyle}>
        <p style={sectionEyebrowStyle}>Latest memory</p>
        <h3 style={dashboardTitleStyle}>No memories yet</h3>
        <p style={dashboardBodyStyle}>
          Start adding photos, videos, or love notes so your home page can show
          your latest special moment.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("Gallery")}
          style={dashboardButtonStyle}
        >
          Go to Gallery
        </button>
      </div>
    );
  }

  const previewUrl = item.fileUrl ? `${API_BASE}${item.fileUrl}` : "";

  return (
    <div style={dashboardPanelStyle}>
      <p style={sectionEyebrowStyle}>Latest memory</p>
      <h3 style={dashboardTitleStyle}>{item.title}</h3>
      <p style={dashboardSubtleStyle}>{formatMemoryDate(item.createdAt)}</p>

      {item.type === "photo" && previewUrl ? (
        <div style={latestPreviewWrapStyle}>
          <img
            src={previewUrl}
            alt={item.title}
            loading="lazy"
            style={latestPreviewMediaStyle}
          />
        </div>
      ) : item.type === "video" && previewUrl ? (
        <div style={latestPreviewWrapStyle}>
          <video
            src={previewUrl}
            muted
            preload="metadata"
            style={latestPreviewMediaStyle}
          />
        </div>
      ) : (
        <div style={latestTextOnlyStyle}>Written memory</div>
      )}

      <p style={dashboardBodyStyle}>{item.description}</p>

      <button
        type="button"
        onClick={() => onNavigate("Gallery")}
        style={dashboardButtonStyle}
      >
        Open Gallery
      </button>
    </div>
  );
}

function HomeDashboard({ setCurrentPage }) {
  const [stats, setStats] = useState({
    totalMemories: 0,
    totalStories: 0,
    photoCount: 0,
    videoCount: 0,
    storyMemoryCount: 0,
    pinnedCount: 0,
  });

  const [latestMemory, setLatestMemory] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [latestError, setLatestError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoadingStats(true);
        setLoadingLatest(true);
        setStatsError("");
        setLatestError("");

        const [statsResult, latestResult] = await Promise.all([
          apiGet("/api/stats"),
          apiGet("/api/memories", { page: 1, limit: 1 }),
        ]);

        if (!active) return;

        setStats(statsResult.data || {});

        const firstItem = Array.isArray(latestResult?.data?.items)
          ? latestResult.data.items[0] || null
          : null;

        setLatestMemory(firstItem);
      } catch (error) {
        if (!active) return;

        const message = error.message || "Failed to load dashboard.";
        setStatsError(message);
        setLatestError(message);
      } finally {
        if (active) {
          setLoadingStats(false);
          setLoadingLatest(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const statsLoadingValue = loadingStats ? "..." : null;

  return (
    <section
      style={{
        position: "relative",
        zIndex: 10,
        padding: "0 16px 34px",
      }}
    >
      <div
        style={{
          maxWidth: "1380px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
        }}
      >
        <div style={dashboardPanelStyle}>
          <p style={sectionEyebrowStyle}>Our little dashboard</p>
          <h2 style={dashboardHeadingStyle}>
            A quick view of our love archive
          </h2>
          <p style={dashboardBodyStyle}>
            This section gives you a clean snapshot of the memories, story
            entries, and the newest moment saved in your website.
          </p>

          {statsError ? (
            <p style={{ ...dashboardBodyStyle, color: "#ffd4df" }}>
              {statsError}
            </p>
          ) : null}

          <div style={statsGridStyle}>
            <StatsCard
              label="Total memories"
              value={statsLoadingValue ?? stats.totalMemories}
              note="All saved memory cards"
            />
            <StatsCard
              label="Story entries"
              value={statsLoadingValue ?? stats.totalStories}
              note="Timeline chapters saved"
            />
            <StatsCard
              label="Photos"
              value={statsLoadingValue ?? stats.photoCount}
              note="Image memories"
            />
            <StatsCard
              label="Videos"
              value={statsLoadingValue ?? stats.videoCount}
              note="Video memories"
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "24px",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            alignItems: "start",
          }}
        >
          <LatestMemoryCard
            item={latestMemory}
            loading={loadingLatest}
            error={latestError}
            onNavigate={setCurrentPage}
          />

          <div style={dashboardPanelStyle}>
            <p style={sectionEyebrowStyle}>Quick shortcuts</p>
            <h3 style={dashboardTitleStyle}>Jump where you want faster</h3>

            <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
              <QuickLinkCard
                title="Open Our Story"
                text="Add new timeline moments or read your journey together."
                page="Our Story"
                onNavigate={setCurrentPage}
              />
              <QuickLinkCard
                title="Open Gallery"
                text="Upload new photos, videos, and little memory notes."
                page="Gallery"
                onNavigate={setCurrentPage}
              />
              <QuickLinkCard
                title="Open For Her"
                text="View her page with favorites, moments, and music."
                page="For Her"
                onNavigate={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const badgeStyle = {
  ...smallBadgeStyle,
};

const pillStyle = {
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.05)",
  padding: "10px 18px",
  fontWeight: 700,
  color: "#ffe7f1",
  fontSize: "14px",
};

const quoteBoxStyle = {
  marginTop: "22px",
  borderRadius: "22px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  padding: "18px",
  maxWidth: "760px",
};

const dashboardPanelStyle = {
  ...glassPanelStyle,
  borderRadius: "30px",
  boxShadow: "0 20px 50px rgba(60,0,28,0.22)",
};

const sectionEyebrowStyle = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#ffd2e4",
};

const dashboardHeadingStyle = {
  margin: "12px 0 0",
  fontSize: "clamp(28px, 5vw, 36px)",
  fontWeight: 900,
  color: "#ffe8f1",
  lineHeight: 1.1,
};

const dashboardTitleStyle = {
  margin: "12px 0 0",
  fontSize: "24px",
  fontWeight: 800,
  color: "#ffe8f1",
  lineHeight: 1.15,
};

const dashboardSubtleStyle = {
  margin: "10px 0 0",
  color: "#ffd7e7",
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: 1.6,
};

const dashboardBodyStyle = {
  margin: "12px 0 0",
  color: "#fff0f6",
  lineHeight: 1.8,
  fontSize: "15px",
};

const statsGridStyle = {
  marginTop: "18px",
  display: "grid",
  gap: "14px",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
};

const statsCardStyle = {
  borderRadius: "22px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.05)",
  padding: "18px",
};

const statsLabelStyle = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#ffd2e4",
};

const statsValueStyle = {
  margin: "12px 0 0",
  fontSize: "32px",
  fontWeight: 900,
  lineHeight: 1,
  color: "#ffe8f1",
};

const statsNoteStyle = {
  margin: "10px 0 0",
  fontSize: "13px",
  color: "#ffd8e7",
  lineHeight: 1.6,
};

const dashboardButtonStyle = {
  border: "none",
  borderRadius: "18px",
  padding: "14px 16px",
  background: "linear-gradient(180deg, #ff5ea2, #ff2e86)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(255,46,134,0.35)",
  marginTop: "18px",
};

const latestPreviewWrapStyle = {
  marginTop: "16px",
  overflow: "hidden",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
};

const latestPreviewMediaStyle = {
  width: "100%",
  aspectRatio: "16 / 10",
  objectFit: "cover",
  display: "block",
};

const latestTextOnlyStyle = {
  marginTop: "16px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  padding: "18px",
  color: "#ffe7f1",
  fontWeight: 700,
  textAlign: "center",
};

const quickLinkCardStyle = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.05)",
  padding: "18px",
  textAlign: "left",
  cursor: "pointer",
  color: "inherit",
};

const quickLinkLabelStyle = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#ffd2e4",
};

const quickLinkTitleStyle = {
  margin: "10px 0 0",
  fontSize: "20px",
  fontWeight: 800,
  color: "#ffe8f1",
  lineHeight: 1.2,
};

const quickLinkTextStyle = {
  margin: "10px 0 0",
  color: "#fff0f6",
  lineHeight: 1.7,
  fontSize: "14px",
};

const quickLinkHintStyle = {
  marginTop: "14px",
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

export default function HomePage({ musicCard, setCurrentPage }) {
  return (
    <>
      <Hero musicCard={musicCard} />
      <HomeDashboard setCurrentPage={setCurrentPage} />
      <AnniversaryCountdown />
    </>
  );
}
