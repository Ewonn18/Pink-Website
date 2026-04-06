import { useEffect, useMemo, useState } from "react";
import SectionTitle from "../components/SectionTitle";
import Toast from "../components/Toast";
import { API_BASE, fallbackLoveStoryTimeline } from "../data/siteContent";
import useFeedbackUI from "../hooks/useFeedbackUI";
import useWindowWidth from "../hooks/useWindowWidth";
import { adminPanelStyle, adminTypeBadgeStyle } from "../styles/adminForm";

function formatTimelineDate(value) {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function sortByDateAscending(items) {
  return [...items].sort((a, b) => {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();

    if (!Number.isFinite(first) && !Number.isFinite(second)) return 0;
    if (!Number.isFinite(first)) return 1;
    if (!Number.isFinite(second)) return -1;

    return first - second;
  });
}

function buildStoryChapters(memories) {
  if (!Array.isArray(memories)) return [];

  return memories
    .filter((item) => item?.type === "story")
    .map((item) => ({
      id: `memory-${item.id}`,
      date: item.createdAt,
      title: item.title || "Untitled chapter",
      text: item.description || "",
      source: "memory",
    }))
    .filter((item) => item.text.trim());
}

function StoryIntroCard() {
  return (
    <div
      style={{
        ...adminPanelStyle,
        padding: "28px",
      }}
    >
      <div style={adminTypeBadgeStyle}>Our Love Story</div>

      <h3
        style={{
          margin: "16px 0 0",
          fontSize: "28px",
          lineHeight: 1.15,
          color: "#ffe8f1",
          fontWeight: 800,
        }}
      >
        A timeline of how we found each other
      </h3>

      <p
        style={{
          margin: "14px 0 0",
          color: "#fff0f6",
          fontSize: "15px",
          lineHeight: 1.9,
        }}
      >
        This page is for the milestones, little beginnings, and meaningful
        chapters that turned us into us. It is not meant to be a media wall — it
        is the softer, more personal side of everything we have built together.
      </p>
    </div>
  );
}

function StoryStats({ timelineCount, chapterCount }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "18px",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}
    >
      <div
        style={{
          ...adminPanelStyle,
          padding: "22px",
        }}
      >
        <div style={adminTypeBadgeStyle}>Milestones</div>
        <div
          style={{
            marginTop: "14px",
            fontSize: "34px",
            fontWeight: 900,
            color: "#ffe8f1",
            lineHeight: 1,
          }}
        >
          {timelineCount}
        </div>
        <p
          style={{
            margin: "10px 0 0",
            color: "#ffd8e7",
            lineHeight: 1.7,
            fontSize: "14px",
          }}
        >
          Important dates and moments in your relationship journey.
        </p>
      </div>

      <div
        style={{
          ...adminPanelStyle,
          padding: "22px",
        }}
      >
        <div style={adminTypeBadgeStyle}>Story Chapters</div>
        <div
          style={{
            marginTop: "14px",
            fontSize: "34px",
            fontWeight: 900,
            color: "#ffe8f1",
            lineHeight: 1,
          }}
        >
          {chapterCount}
        </div>
        <p
          style={{
            margin: "10px 0 0",
            color: "#ffd8e7",
            lineHeight: 1.7,
            fontSize: "14px",
          }}
        >
          Written memories pulled from your saved story entries.
        </p>
      </div>
    </div>
  );
}

function TimelineCard({ item, index }) {
  return (
    <div
      style={{
        position: "relative",
        paddingLeft: "28px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "0",
          top: "8px",
          width: "14px",
          height: "14px",
          borderRadius: "999px",
          background: "linear-gradient(135deg, #ff8fbd 0%, #ff5f99 100%)",
          boxShadow: "0 0 0 6px rgba(255,143,189,0.12)",
        }}
      />

      <div
        style={{
          ...adminPanelStyle,
          padding: "22px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={adminTypeBadgeStyle}>
            {index === 0 ? "Beginning" : "Chapter"}
          </div>

          <p
            style={{
              margin: 0,
              color: "#ffd3e4",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {formatTimelineDate(item.date)}
          </p>
        </div>

        <h3
          style={{
            margin: "14px 0 0",
            color: "#ffe8f1",
            fontSize: "24px",
            lineHeight: 1.15,
            fontWeight: 800,
          }}
        >
          {item.title}
        </h3>

        <p
          style={{
            margin: "14px 0 0",
            color: "#fff0f6",
            fontSize: "15px",
            lineHeight: 1.9,
          }}
        >
          {item.text}
        </p>
      </div>
    </div>
  );
}

function ChapterCard({ chapter }) {
  return (
    <div
      style={{
        ...adminPanelStyle,
        padding: "22px",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={adminTypeBadgeStyle}>Written Memory</div>

        <p
          style={{
            margin: 0,
            color: "#ffd3e4",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          {formatTimelineDate(chapter.date)}
        </p>
      </div>

      <h3
        style={{
          margin: "14px 0 0",
          color: "#ffe8f1",
          fontSize: "22px",
          lineHeight: 1.15,
          fontWeight: 800,
        }}
      >
        {chapter.title}
      </h3>

      <p
        style={{
          margin: "14px 0 0",
          color: "#fff0f6",
          fontSize: "15px",
          lineHeight: 1.85,
          whiteSpace: "pre-wrap",
        }}
      >
        {chapter.text}
      </p>
    </div>
  );
}

function EmptyChaptersState() {
  return (
    <div
      style={{
        ...adminPanelStyle,
        padding: "28px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          margin: "0 auto 16px",
          borderRadius: "999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.10)",
          fontSize: "26px",
        }}
      >
        ♡
      </div>

      <h3
        style={{
          margin: 0,
          color: "#ffe8f1",
          fontSize: "24px",
          fontWeight: 800,
        }}
      >
        No written story chapters yet
      </h3>

      <p
        style={{
          margin: "10px auto 0",
          maxWidth: "580px",
          color: "#ffd8e7",
          fontSize: "15px",
          lineHeight: 1.8,
        }}
      >
        Your main timeline is already here, and any saved memories marked as
        “story” will appear below as extra chapters of your relationship.
      </p>
    </div>
  );
}

export default function StoryPage({ musicCard }) {
  const [storyMemories, setStoryMemories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);

  const windowWidth = useWindowWidth();
  const { toast, showToast, hideToast } = useFeedbackUI();

  useEffect(() => {
    let isMounted = true;

    async function fetchStoryMemories() {
      try {
        setLoadingStories(true);

        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "50");
        params.set("type", "story");

        const response = await fetch(
          `${API_BASE}/api/memories?${params.toString()}`,
        );

        let result = null;
        try {
          result = await response.json();
        } catch {
          result = null;
        }

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Failed to fetch story memories.");
        }

        const items = Array.isArray(result?.data?.items)
          ? result.data.items
          : [];

        if (isMounted) {
          setStoryMemories(items);
        }
      } catch (error) {
        if (isMounted) {
          setStoryMemories([]);
          showToast(error.message || "Failed to load story memories.", "error");
        }
      } finally {
        if (isMounted) {
          setLoadingStories(false);
        }
      }
    }

    fetchStoryMemories();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const timelineItems = useMemo(
    () => sortByDateAscending(fallbackLoveStoryTimeline),
    [],
  );

  const storyChapters = useMemo(
    () => sortByDateAscending(buildStoryChapters(storyMemories)),
    [storyMemories],
  );

  const hasSideMusicColumn = Boolean(musicCard) && windowWidth >= 1700;

  const layoutStyle = hasSideMusicColumn
    ? {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 320px",
        gap: "28px",
        alignItems: "start",
      }
    : {
        display: "grid",
        gap: "28px",
      };

  return (
    <>
      <section
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1480px",
          margin: "0 auto",
          padding: "48px 20px",
        }}
      >
        <SectionTitle
          title="Our Story"
          subtitle="A softer space for the milestones, beginnings, and chapters that mean the most to us."
        />

        <div style={layoutStyle}>
          <div style={{ display: "grid", gap: "28px" }}>
            <StoryIntroCard />

            <StoryStats
              timelineCount={timelineItems.length}
              chapterCount={storyChapters.length}
            />

            <section style={{ display: "grid", gap: "18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
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
                    Relationship Timeline
                  </p>

                  <h2
                    style={{
                      margin: "8px 0 0",
                      color: "#ffe8f1",
                      fontSize: "30px",
                      lineHeight: 1.1,
                    }}
                  >
                    The moments that shaped us
                  </h2>
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  display: "grid",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "6px",
                    top: "12px",
                    bottom: "12px",
                    width: "2px",
                    background:
                      "linear-gradient(180deg, rgba(255,143,189,0.45) 0%, rgba(255,95,153,0.08) 100%)",
                  }}
                />

                {timelineItems.map((item, index) => (
                  <TimelineCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </section>

            <section style={{ display: "grid", gap: "18px" }}>
              <div>
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
                  Written Chapters
                </p>

                <h2
                  style={{
                    margin: "8px 0 0",
                    color: "#ffe8f1",
                    fontSize: "30px",
                    lineHeight: 1.1,
                  }}
                >
                  Love notes that belong in the story
                </h2>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "#ffd8e7",
                    fontSize: "15px",
                    lineHeight: 1.8,
                    maxWidth: "760px",
                  }}
                >
                  These are pulled from saved memories marked as “story”, so the
                  Our Story page stays narrative-focused while Gallery remains
                  your media and upload space.
                </p>
              </div>

              {loadingStories ? (
                <div
                  style={{
                    ...adminPanelStyle,
                    padding: "24px",
                    color: "#ffe8f1",
                  }}
                >
                  Loading story chapters...
                </div>
              ) : storyChapters.length === 0 ? (
                <EmptyChaptersState />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "22px",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  }}
                >
                  {storyChapters.map((chapter) => (
                    <ChapterCard key={chapter.id} chapter={chapter} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {musicCard && hasSideMusicColumn ? (
            <div style={{ position: "sticky", top: "92px" }}>{musicCard}</div>
          ) : null}
        </div>

        {musicCard && !hasSideMusicColumn ? (
          <div style={{ marginTop: "28px" }}>{musicCard}</div>
        ) : null}
      </section>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
}
