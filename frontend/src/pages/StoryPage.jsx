import { useEffect, useMemo, useState } from "react";
import SectionTitle from "../components/SectionTitle";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import AdminAccessPanel from "../components/AdminAccessPanel";
import AdminFormActions from "../components/AdminFormActions";
import { API_BASE, fallbackLoveStoryTimeline } from "../data/siteContent";
import useFeedbackUI from "../hooks/useFeedbackUI";
import useWindowWidth from "../hooks/useWindowWidth";
import { getAdminHeaders } from "../utils/adminAuth";
import {
  adminPanelStyle,
  adminPanelTitleStyle,
  adminPanelSubtitleStyle,
  adminTopBadgeStyle,
  adminFieldLabelStyle,
  adminInputStyle,
  adminTextareaStyle,
  adminTypeBadgeStyle,
} from "../styles/adminForm";
import {
  primaryButtonStyle,
  secondaryButtonStyle,
  ghostButtonStyle,
  dangerButtonStyle,
} from "../styles/buttons";

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
      id: item.id,
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
        chapters that turned us into us. It is the softer, more personal side of
        everything you have built together.
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
          Written memories pulled from saved story entries.
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

function ChapterCard({ chapter, showAdmin, onEdit, onDelete }) {
  return (
    <div
      style={{
        ...adminPanelStyle,
        padding: "22px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
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
          flex: 1,
        }}
      >
        {chapter.text}
      </p>

      {showAdmin ? (
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "18px",
          }}
        >
          <button onClick={() => onEdit(chapter)} style={secondaryButtonStyle}>
            Edit
          </button>
          <button
            onClick={() => onDelete(chapter.id)}
            style={dangerButtonStyle}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EmptyChaptersState({ showAdmin }) {
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
        {showAdmin
          ? "Admin mode is on. You can create your first story chapter from the panel on this page."
          : "Your main timeline is already here, and any saved memories marked as “story” will appear below as extra chapters of your relationship."}
      </p>
    </div>
  );
}

function StoryChapterForm({
  editingChapter,
  onSuccess,
  onCancelEdit,
  showToast,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingChapter) {
      setForm({
        title: editingChapter.title || "",
        description: editingChapter.text || "",
      });
      return;
    }

    setForm({
      title: "",
      description: "",
    });
  }, [editingChapter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: "story",
      };

      const isEditing = Boolean(editingChapter);

      const response = await fetch(
        isEditing
          ? `${API_BASE}/api/memories/${editingChapter.id}`
          : `${API_BASE}/api/memories`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            ...getAdminHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      let result = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
            (isEditing
              ? "Failed to update story chapter."
              : "Failed to create story chapter."),
        );
      }

      setForm({
        title: "",
        description: "",
      });

      await onSuccess();

      showToast(
        isEditing
          ? "Story chapter updated successfully."
          : "Story chapter added successfully.",
        "success",
      );
    } catch (error) {
      showToast(error.message || "Failed to save story chapter.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={adminPanelStyle}>
      <div style={adminTopBadgeStyle}>Story Editor</div>

      <h3 style={adminPanelTitleStyle}>
        {editingChapter ? "Edit Story Chapter" : "Add Story Chapter"}
      </h3>

      <p style={adminPanelSubtitleStyle}>
        Write love notes, milestones, and relationship chapters that belong on
        the Our Story page.
      </p>

      <div style={{ display: "grid", gap: "16px", marginTop: "22px" }}>
        <div>
          <label style={adminFieldLabelStyle}>Chapter title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Example: The day we made it official"
            required
            style={adminInputStyle}
          />
        </div>

        <div>
          <label style={adminFieldLabelStyle}>Story text</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write the memory, milestone, or chapter here..."
            rows={6}
            required
            style={{
              ...adminTextareaStyle,
              minHeight: "170px",
            }}
          />
        </div>

        <AdminFormActions
          isEditing={Boolean(editingChapter)}
          isLoading={loading}
          createText="Save Story"
          createLoadingText="Saving..."
          editText="Save Changes"
          editLoadingText="Saving..."
          onCancel={onCancelEdit}
          buttonStyle={primaryButtonStyle}
          ghostButtonStyle={ghostButtonStyle}
        />
      </div>
    </form>
  );
}

export default function StoryPage({ musicCard, showAdmin = false }) {
  const [storyMemories, setStoryMemories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [editingChapter, setEditingChapter] = useState(null);

  const windowWidth = useWindowWidth();
  const {
    toast,
    showToast,
    hideToast,
    confirmState,
    openConfirm,
    closeConfirm,
  } = useFeedbackUI();

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

      const items = Array.isArray(result?.data?.items) ? result.data.items : [];
      setStoryMemories(items);
    } catch (error) {
      setStoryMemories([]);
      showToast(error.message || "Failed to load story memories.", "error");
    } finally {
      setLoadingStories(false);
    }
  }

  useEffect(() => {
    fetchStoryMemories();
  }, []);

  const timelineItems = useMemo(
    () => sortByDateAscending(fallbackLoveStoryTimeline),
    [],
  );

  const storyChapters = useMemo(
    () => sortByDateAscending(buildStoryChapters(storyMemories)),
    [storyMemories],
  );

  const hasSideMusicColumn = Boolean(musicCard) && windowWidth >= 1700;
  const hasAdminSidebar = showAdmin && windowWidth >= 1180;

  let layoutStyle = {
    display: "grid",
    gap: "28px",
    alignItems: "start",
  };

  if (hasAdminSidebar && hasSideMusicColumn) {
    layoutStyle.gridTemplateColumns = "320px minmax(0, 1fr) 320px";
  } else if (hasAdminSidebar) {
    layoutStyle.gridTemplateColumns = "320px minmax(0, 1fr)";
  } else if (hasSideMusicColumn) {
    layoutStyle.gridTemplateColumns = "minmax(0, 1fr) 320px";
  }

  async function handleChapterSaved() {
    setEditingChapter(null);
    await fetchStoryMemories();
  }

  function handleEditChapter(chapter) {
    setEditingChapter(chapter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteStoryChapter(id) {
    try {
      const response = await fetch(`${API_BASE}/api/memories/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });

      let result = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to delete story chapter.");
      }

      if (editingChapter?.id === id) {
        setEditingChapter(null);
      }

      await fetchStoryMemories();
      showToast("Story chapter deleted successfully.", "success");
    } catch (error) {
      showToast(error.message || "Failed to delete story chapter.", "error");
    } finally {
      closeConfirm();
    }
  }

  function askDeleteChapter(id) {
    openConfirm({
      title: "Delete this story chapter?",
      message:
        "This written chapter will be removed from the Our Story page permanently. This action cannot be undone.",
      onConfirm: () => deleteStoryChapter(id),
    });
  }

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
          {showAdmin ? (
            <div
              style={
                hasAdminSidebar
                  ? { position: "sticky", top: "92px" }
                  : undefined
              }
            >
              <AdminAccessPanel showToast={showToast} />
              <StoryChapterForm
                editingChapter={editingChapter}
                onSuccess={handleChapterSaved}
                onCancelEdit={() => setEditingChapter(null)}
                showToast={showToast}
              />
            </div>
          ) : null}

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
                <EmptyChaptersState showAdmin={showAdmin} />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "22px",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  }}
                >
                  {storyChapters.map((chapter) => (
                    <ChapterCard
                      key={chapter.id}
                      chapter={chapter}
                      showAdmin={showAdmin}
                      onEdit={handleEditChapter}
                      onDelete={askDeleteChapter}
                    />
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

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={confirmState.onConfirm || closeConfirm}
        onCancel={closeConfirm}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
}
