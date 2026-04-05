import { useEffect, useState } from "react";
import SectionTitle from "../components/SectionTitle";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import FilterToolbar from "../components/FilterToolbar";
import ListControls from "../components/ListControls";
import AdminFormActions from "../components/AdminFormActions";
import AdminAccessPanel from "../components/AdminAccessPanel";
import { API_BASE, fallbackLoveStoryTimeline } from "../data/siteContent";
import useWindowWidth from "../hooks/useWindowWidth";
import useFeedbackUI from "../hooks/useFeedbackUI";
import { getAdminHeaders } from "../utils/adminAuth";
import {
  adminPanelCompactStyle,
  adminPanelTitleWithTopMarginStyle,
  adminPanelSubtitleStyle,
  adminTopBadgeStyle,
  adminFieldLabelStyle,
  adminInputStyle,
  adminTextareaStyle,
  adminActiveFilterPillStyle,
  adminDateBadgeStyle,
} from "../styles/adminForm";
import {
  primaryButtonStyle,
  ghostButtonStyle,
  dangerButtonStyle,
} from "../styles/buttons";

const PAGE_LIMIT = 5;

function StoryForm({ onSuccess, editingStory, onCancelEdit, showToast }) {
  const [form, setForm] = useState({
    date: "",
    title: "",
    text: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingStory) {
      setForm({
        date: editingStory.date || "",
        title: editingStory.title || "",
        text: editingStory.text || "",
      });
    } else {
      setForm({
        date: "",
        title: "",
        text: "",
      });
    }
  }, [editingStory]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const isEditing = Boolean(editingStory);
      const url = isEditing
        ? `${API_BASE}/api/stories/${editingStory.id}`
        : `${API_BASE}/api/stories`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getAdminHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(form),
      });

      let result = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
            (isEditing ? "Failed to update story." : "Failed to create story."),
        );
      }

      setForm({ date: "", title: "", text: "" });
      onSuccess();

      showToast(
        isEditing ? "Story updated successfully." : "Story added successfully.",
        "success",
      );
    } catch (error) {
      showToast(error.message || "Failed to save story.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={adminPanelCompactStyle}>
      <div style={adminTopBadgeStyle}>Timeline Editor</div>

      <h3 style={adminPanelTitleWithTopMarginStyle}>
        {editingStory ? "Edit Story" : "Add a Story"}
      </h3>

      <p style={adminPanelSubtitleStyle}>
        Add timeline moments that tell your story one memory at a time.
      </p>

      <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
        <div>
          <label style={adminFieldLabelStyle}>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            style={adminInputStyle}
          />
        </div>

        <div>
          <label style={adminFieldLabelStyle}>Story title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Story title"
            required
            style={adminInputStyle}
          />
        </div>

        <div>
          <label style={adminFieldLabelStyle}>Story text</label>
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            placeholder="Write the story here..."
            rows={6}
            required
            style={adminTextareaStyle}
          />
        </div>

        <AdminFormActions
          isEditing={Boolean(editingStory)}
          isLoading={submitting}
          createText="Add Story"
          createLoadingText="Adding..."
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

function StoryCard({
  item,
  hasLineBelow,
  onEdit,
  onDelete,
  showAdmin = false,
}) {
  return (
    <div
      style={{
        position: "relative",
        paddingLeft: "30px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "6px",
          top: "8px",
          bottom: hasLineBelow ? "-20px" : "0",
          width: "2px",
          background: "rgba(255,255,255,0.10)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: "12px",
          width: "14px",
          height: "14px",
          borderRadius: "999px",
          background: "linear-gradient(180deg, #ff5ea2 0%, #ff2e86 100%)",
          boxShadow: "0 0 0 5px rgba(255,255,255,0.06)",
        }}
      />

      <div
        style={{
          ...adminPanelCompactStyle,
          padding: "20px 22px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={adminDateBadgeStyle}>
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <h3
              style={{
                margin: "14px 0 0",
                fontSize: "24px",
                fontWeight: 800,
                color: "#ffe8f1",
                lineHeight: 1.2,
              }}
            >
              {item.title}
            </h3>
          </div>

          {showAdmin ? (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={() => onEdit(item)} style={ghostButtonStyle}>
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                style={dangerButtonStyle}
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>

        <p
          style={{
            margin: "14px 0 0",
            lineHeight: 1.85,
            color: "#fff0f6",
            fontSize: "15px",
            overflowWrap: "anywhere",
          }}
        >
          {item.text}
        </p>
      </div>
    </div>
  );
}

function EmptyStoryState({ searchQuery }) {
  const hasSearch = searchQuery.trim();

  return (
    <div style={adminPanelCompactStyle}>
      <h3
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: 800,
          color: "#ffe8f1",
        }}
      >
        {hasSearch ? "No stories matched" : "No story entries yet"}
      </h3>

      <p
        style={{
          marginTop: "10px",
          color: "#ffd8e7",
          lineHeight: 1.7,
          fontSize: "15px",
        }}
      >
        {hasSearch
          ? "Try a different search word."
          : "Add your first timeline memory to start your love story here."}
      </p>
    </div>
  );
}

export default function StoryPage({ musicCard, showAdmin = false }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const windowWidth = useWindowWidth();
  const {
    toast,
    showToast,
    hideToast,
    confirmState,
    openConfirm,
    closeConfirm,
  } = useFeedbackUI();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });

  async function fetchStories(page = 1, shouldReplace = false) {
    try {
      if (page === 1) {
        setLoading(true);
      }

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_LIMIT));
      params.set("sort", sortOrder);

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const response = await fetch(
        `${API_BASE}/api/stories?${params.toString()}`,
      );

      let result = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to fetch stories.");
      }

      const nextItems = Array.isArray(result?.data?.items)
        ? result.data.items
        : [];

      const nextPagination = result?.data?.pagination || {
        page: 1,
        limit: PAGE_LIMIT,
        total: nextItems.length,
        totalPages: 1,
        hasMore: false,
      };

      if (page === 1 && nextPagination.total === 0 && !searchQuery.trim()) {
        setUsingFallback(true);
        setStories(fallbackLoveStoryTimeline);
        setPagination({
          page: 1,
          limit: PAGE_LIMIT,
          total: fallbackLoveStoryTimeline.length,
          totalPages: 1,
          hasMore: false,
        });
        return;
      }

      setUsingFallback(false);
      setStories((prev) =>
        shouldReplace ? nextItems : [...prev, ...nextItems],
      );
      setPagination(nextPagination);
    } catch (error) {
      console.error("Failed to fetch stories:", error);

      if (page === 1 && !searchQuery.trim()) {
        setUsingFallback(true);
        setStories(fallbackLoveStoryTimeline);
        setPagination({
          page: 1,
          limit: PAGE_LIMIT,
          total: fallbackLoveStoryTimeline.length,
          totalPages: 1,
          hasMore: false,
        });
      } else if (page === 1) {
        setStories([]);
        setUsingFallback(false);
      }

      showToast(error.message || "Failed to fetch stories.", "error");
    } finally {
      if (page === 1) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchStories(1, true);
  }, [searchQuery, sortOrder]);

  useEffect(() => {
    if (!showAdmin) {
      setEditingStory(null);
    }
  }, [showAdmin]);

  async function deleteStory(id) {
    try {
      const response = await fetch(`${API_BASE}/api/stories/${id}`, {
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
        throw new Error(result?.message || "Failed to delete story.");
      }

      if (editingStory?.id === id) {
        setEditingStory(null);
      }

      await fetchStories(1, true);
      showToast("Story deleted successfully.", "success");
    } catch (error) {
      showToast(error.message || "Failed to delete story.", "error");
    } finally {
      closeConfirm();
    }
  }

  function askDeleteStory(id) {
    openConfirm({
      title: "Delete this story?",
      message:
        "This story will be removed from your timeline permanently. This action cannot be undone.",
      onConfirm: () => deleteStory(id),
    });
  }

  function handleEditStory(story) {
    if (!showAdmin) return;
    setEditingStory(story);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFormSuccess() {
    setEditingStory(null);
    await fetchStories(1, true);
  }

  async function handleLoadMore() {
    if (usingFallback || !pagination.hasMore) return;
    await fetchStories(pagination.page + 1, false);
  }

  async function handleShowLess() {
    await fetchStories(1, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  function handleResetFilters() {
    setSearchInput("");
    setSearchQuery("");
    setSortOrder("asc");
  }

  const isDesktop = windowWidth >= 1220;
  const isTablet = windowWidth >= 860 && windowWidth < 1220;

  let layoutStyle = {
    display: "grid",
    gap: "24px",
    alignItems: "start",
  };

  if (isDesktop) {
    layoutStyle.gridTemplateColumns =
      showAdmin && musicCard
        ? "320px minmax(0, 1fr) 340px"
        : showAdmin
          ? "320px minmax(0, 1fr)"
          : musicCard
            ? "minmax(0, 1fr) 340px"
            : "1fr";
  } else if (isTablet) {
    layoutStyle.gridTemplateColumns = showAdmin
      ? "300px minmax(0, 1fr)"
      : "1fr";
  } else {
    layoutStyle.gridTemplateColumns = "1fr";
  }

  const canShowLess = !usingFallback && stories.length > PAGE_LIMIT;
  const showControls = (!usingFallback && pagination.hasMore) || canShowLess;

  const summaryText = usingFallback
    ? `${fallbackLoveStoryTimeline.length} fallback stories showing.`
    : pagination.total === 0
      ? "No stories yet."
      : pagination.total === 1
        ? "1 story saved."
        : `${pagination.total} stories saved.`;

  const activeFilters = [
    ...(searchQuery ? [`Search: ${searchQuery}`] : []),
    `Sort: ${sortOrder === "desc" ? "newest first" : "oldest first"}`,
  ];

  return (
    <>
      <section
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1380px",
          margin: "0 auto",
          padding: "48px 16px",
        }}
      >
        <SectionTitle
          title="Our Story"
          subtitle="A timeline of little moments, big feelings, and the memories that made us."
        />

        <div style={layoutStyle}>
          {showAdmin ? (
            <div
              style={
                isDesktop ? { position: "sticky", top: "92px" } : undefined
              }
            >
              <AdminAccessPanel showToast={showToast} />

              <StoryForm
                onSuccess={handleFormSuccess}
                editingStory={editingStory}
                onCancelEdit={() => setEditingStory(null)}
                showToast={showToast}
              />
            </div>
          ) : null}

          <div>
            <FilterToolbar
              summaryText={summaryText}
              helperText="Every chapter matters."
              searchInput={searchInput}
              onSearchInputChange={(event) =>
                setSearchInput(event.target.value)
              }
              searchPlaceholder="Search stories..."
              secondaryControl={
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  style={adminInputStyle}
                >
                  <option value="asc">Oldest first</option>
                  <option value="desc">Newest first</option>
                </select>
              }
              onSubmit={handleSearchSubmit}
              onReset={handleResetFilters}
              activeFilters={activeFilters}
              windowWidth={windowWidth}
              inputStyle={adminInputStyle}
              buttonStyle={primaryButtonStyle}
              ghostButtonStyle={ghostButtonStyle}
              activeFilterPillStyle={adminActiveFilterPillStyle}
            />

            {loading ? (
              <div style={adminPanelCompactStyle}>Loading our story...</div>
            ) : stories.length === 0 ? (
              <EmptyStoryState searchQuery={searchQuery} />
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gap: "20px",
                  }}
                >
                  {stories.map((item, index) => (
                    <StoryCard
                      key={item.id}
                      item={item}
                      hasLineBelow={index !== stories.length - 1}
                      onEdit={handleEditStory}
                      onDelete={askDeleteStory}
                      showAdmin={showAdmin}
                    />
                  ))}
                </div>

                <ListControls
                  showControls={showControls}
                  canLoadMore={!usingFallback && pagination.hasMore}
                  canShowLess={canShowLess}
                  onLoadMore={handleLoadMore}
                  onShowLess={handleShowLess}
                  buttonStyle={primaryButtonStyle}
                  ghostButtonStyle={ghostButtonStyle}
                />
              </>
            )}
          </div>

          {musicCard && isDesktop ? (
            <div style={{ position: "sticky", top: "92px" }}>{musicCard}</div>
          ) : null}
        </div>

        {musicCard && !isDesktop ? (
          <div style={{ marginTop: "24px" }}>{musicCard}</div>
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
