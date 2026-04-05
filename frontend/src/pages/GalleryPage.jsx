import { useEffect, useMemo, useState } from "react";
import SectionTitle from "../components/SectionTitle";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import FilterToolbar from "../components/FilterToolbar";
import ListControls from "../components/ListControls";
import AdminFormActions from "../components/AdminFormActions";
import AdminAccessPanel from "../components/AdminAccessPanel";
import { API_BASE } from "../data/siteContent";
import { resolveMediaUrl } from "../lib/api";
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
  adminTypeBadgeStyle,
  adminMediaHintStyle,
  adminFilePickerRowStyle,
  adminFilePickerButtonStyle,
  adminFileNameStyle,
} from "../styles/adminForm";
import {
  primaryButtonStyle,
  ghostButtonStyle,
  dangerButtonStyle,
} from "../styles/buttons";

const PAGE_LIMIT = 6;

function GalleryForm({
  onSuccess,
  editingMemory,
  onCancelEdit,
  showToast,
  isSubmittingExternally = false,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "photo",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(editingMemory);
  const effectiveSubmitting = submitting || isSubmittingExternally;

  useEffect(() => {
    if (editingMemory) {
      setForm({
        title: editingMemory.title || "",
        description: editingMemory.description || "",
        type: editingMemory.type || "photo",
      });
      setSelectedFile(null);
    } else {
      setForm({
        title: "",
        description: "",
        type: "photo",
      });
      setSelectedFile(null);
    }
  }, [editingMemory]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const url = isEditing
        ? `${API_BASE}/api/memories/${editingMemory.id}`
        : `${API_BASE}/api/memories`;

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("type", form.type);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getAdminHeaders(),
        body: formData,
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
            (isEditing
              ? "Failed to update memory."
              : "Failed to upload memory."),
        );
      }

      setForm({
        title: "",
        description: "",
        type: "photo",
      });
      setSelectedFile(null);

      await onSuccess();

      showToast(
        isEditing
          ? "Memory updated successfully."
          : "Memory uploaded successfully.",
        "success",
      );
    } catch (error) {
      showToast(error.message || "Failed to save memory.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const currentFileName = selectedFile?.name || "";

  return (
    <form onSubmit={handleSubmit} style={adminPanelCompactStyle}>
      <div style={adminTopBadgeStyle}>Memory Uploader</div>

      <h3 style={adminPanelTitleWithTopMarginStyle}>
        {isEditing ? "Edit Memory" : "Upload a Memory"}
      </h3>

      <p style={adminPanelSubtitleStyle}>
        Save photos, videos, or little love notes in one beautiful place.
      </p>

      <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
        <div>
          <label style={adminFieldLabelStyle}>Memory title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Example: First museum date"
            required
            style={adminInputStyle}
          />
        </div>

        <div>
          <label style={adminFieldLabelStyle}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write what made this moment special..."
            rows={5}
            required
            style={adminTextareaStyle}
          />
        </div>

        <div>
          <label style={adminFieldLabelStyle}>Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={adminInputStyle}
          >
            <option value="photo">Photo</option>
            <option value="video">Video</option>
            <option value="note">Note</option>
          </select>
        </div>

        {form.type !== "note" ? (
          <div>
            <label style={adminFieldLabelStyle}>Photo or video</label>

            <div style={adminFilePickerRowStyle}>
              <label style={adminFilePickerButtonStyle}>
                Choose File
                <input
                  type="file"
                  accept={form.type === "video" ? "video/*" : "image/*"}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>

              <div style={adminFileNameStyle}>
                {currentFileName ||
                  (isEditing ? "No new file selected" : "No file selected")}
              </div>
            </div>

            <div style={adminMediaHintStyle}>
              {form.type === "video"
                ? "Upload one video file"
                : "Upload one image file"}
            </div>
          </div>
        ) : null}

        <AdminFormActions
          isEditing={isEditing}
          isLoading={effectiveSubmitting}
          createText="Save Memory"
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

function EmptyGalleryState({ searchQuery }) {
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
        {hasSearch ? "No memories matched" : "Your gallery is still empty"}
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
          ? "Try another search word or reset the filters."
          : "Start with your first photo, video, or little love note and build this page into a timeline of your sweetest memories together."}
      </p>
    </div>
  );
}

function MemoryPreview({ item, compact = false }) {
  if (!item) return null;

  if (item.type === "video" && item.fileUrl) {
    return (
      <video
        src={resolveMediaUrl(item.fileUrl)}
        controls={!compact}
        preload="metadata"
        style={{
          width: "100%",
          display: "block",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.03)",
          maxHeight: compact ? "340px" : "520px",
          objectFit: "cover",
        }}
      />
    );
  }

  if (item.type === "photo" && item.fileUrl) {
    return (
      <img
        src={resolveMediaUrl(item.fileUrl)}
        alt={item.title}
        style={{
          width: "100%",
          display: "block",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.03)",
          maxHeight: compact ? "340px" : "520px",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <div
      style={{
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        padding: compact ? "20px" : "32px",
        color: "#ffe7f1",
        textAlign: "center",
        fontWeight: 700,
      }}
    >
      Open the preview to see the full memory.
    </div>
  );
}

function MemoryViewModal({ item, open, onClose }) {
  if (!open || !item) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(10, 0, 6, 0.72)",
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
          width: "min(980px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(48,0,24,0.92) 0%, rgba(20,0,12,0.96) 100%)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.42)",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={adminTypeBadgeStyle}>{item.type}</div>

            <h3
              style={{
                margin: "14px 0 0",
                fontSize: "30px",
                fontWeight: 900,
                lineHeight: 1.1,
                color: "#ffe8f1",
              }}
            >
              {item.title}
            </h3>

            <p
              style={{
                margin: "10px 0 0",
                color: "#ffd8e7",
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              {formatDateTime(item.createdAt)}
            </p>
          </div>

          <button onClick={onClose} style={ghostButtonStyle}>
            Close
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <MemoryPreview item={item} />
        </div>

        <div
          style={{
            marginTop: "20px",
            borderRadius: "22px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            padding: "18px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#fff0f6",
              lineHeight: 1.8,
              fontSize: "15px",
              overflowWrap: "anywhere",
            }}
          >
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function GalleryCard({ item, onView, onEdit, onDelete }) {
  return (
    <div
      style={{
        ...adminPanelCompactStyle,
        padding: "22px",
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
          <div style={adminTypeBadgeStyle}>{item.type}</div>

          <h3
            style={{
              margin: "14px 0 0",
              fontSize: "24px",
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#ffe8f1",
              overflowWrap: "anywhere",
            }}
          >
            {item.title}
          </h3>

          <p
            style={{
              margin: "10px 0 0",
              color: "#ffd8e7",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            {formatDateTime(item.createdAt)}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => onView(item)} style={ghostButtonStyle}>
            View
          </button>
          <button onClick={() => onEdit(item)} style={ghostButtonStyle}>
            Edit
          </button>
          <button onClick={() => onDelete(item.id)} style={dangerButtonStyle}>
            Delete
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: "18px",
          overflow: "hidden",
          borderRadius: "22px",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <MemoryPreview item={item} compact={true} />
      </div>

      <div style={{ marginTop: "14px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "8px 12px",
            color: "#ffe7f1",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {item.type === "photo"
            ? "Tap to view full photo"
            : item.type === "video"
              ? "Tap to view full video"
              : "Open the full note"}
        </span>
      </div>

      <div
        style={{
          marginTop: "16px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          padding: "16px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#fff0f6",
            lineHeight: 1.8,
            fontSize: "15px",
            overflowWrap: "anywhere",
          }}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "No date";
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "No date";
  }

  return parsed.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function GalleryPage({ musicCard }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState(null);
  const [viewingMemory, setViewingMemory] = useState(null);

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
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("all");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });

  async function fetchMemories(page = 1, shouldReplace = false) {
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

      if (filterType !== "all") {
        params.set("type", filterType);
      }

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
        throw new Error(result?.message || "Failed to fetch memories.");
      }

      const nextItems = Array.isArray(result?.data?.items)
        ? result.data.items
        : [];

      const nextPagination = result?.data?.pagination || {
        page,
        limit: PAGE_LIMIT,
        total: nextItems.length,
        totalPages: 1,
        hasMore: false,
      };

      setMemories((prev) =>
        shouldReplace ? nextItems : [...prev, ...nextItems],
      );
      setPagination(nextPagination);
    } catch (error) {
      if (page === 1) {
        setMemories([]);
      }

      showToast(error.message || "Failed to fetch memories.", "error");
    } finally {
      if (page === 1) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchMemories(1, true);
  }, [searchQuery, sortOrder, filterType]);

  async function handleFormSuccess() {
    setEditingMemory(null);
    await fetchMemories(1, true);
  }

  function handleEditMemory(item) {
    setEditingMemory(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function askDeleteMemory(id) {
    openConfirm({
      title: "Delete this memory?",
      message:
        "This memory will be removed permanently. This action cannot be undone.",
      onConfirm: () => deleteMemory(id),
    });
  }

  async function deleteMemory(id) {
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
        throw new Error(result?.message || "Failed to delete memory.");
      }

      if (editingMemory?.id === id) {
        setEditingMemory(null);
      }

      if (viewingMemory?.id === id) {
        setViewingMemory(null);
      }

      await fetchMemories(1, true);
      showToast("Memory deleted successfully.", "success");
    } catch (error) {
      showToast(error.message || "Failed to delete memory.", "error");
    } finally {
      closeConfirm();
    }
  }

  async function handleLoadMore() {
    if (!pagination.hasMore) return;
    await fetchMemories(pagination.page + 1, false);
  }

  async function handleShowLess() {
    await fetchMemories(1, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  function handleResetFilters() {
    setSearchInput("");
    setSearchQuery("");
    setSortOrder("desc");
    setFilterType("all");
  }

  const isDesktop = windowWidth >= 1220;
  const isTablet = windowWidth >= 860 && windowWidth < 1220;

  let layoutStyle = {
    display: "grid",
    gap: "24px",
    alignItems: "start",
  };

  if (isDesktop) {
    layoutStyle.gridTemplateColumns = musicCard
      ? "320px minmax(0, 1fr) 340px"
      : "320px minmax(0, 1fr)";
  } else if (isTablet) {
    layoutStyle.gridTemplateColumns = "300px minmax(0, 1fr)";
  } else {
    layoutStyle.gridTemplateColumns = "1fr";
  }

  const canShowLess = memories.length > PAGE_LIMIT;
  const showControls = pagination.hasMore || canShowLess;

  const summaryText =
    pagination.total === 0
      ? "No memories yet."
      : pagination.total === 1
        ? "1 memory saved."
        : `${pagination.total} memories saved.`;

  const activeFilters = useMemo(
    () => [
      ...(searchQuery ? [`Search: ${searchQuery}`] : []),
      ...(filterType !== "all"
        ? [`Type: ${filterType.charAt(0).toUpperCase()}${filterType.slice(1)}`]
        : []),
      `Sort: ${sortOrder === "asc" ? "oldest first" : "newest first"}`,
    ],
    [searchQuery, filterType, sortOrder],
  );

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
          title="Gallery"
          subtitle="A place for the photos, videos, and little notes that help us remember the sweetest parts of us."
        />

        <div style={layoutStyle}>
          <div
            style={isDesktop ? { position: "sticky", top: "92px" } : undefined}
          >
            <AdminAccessPanel showToast={showToast} />

            <GalleryForm
              onSuccess={handleFormSuccess}
              editingMemory={editingMemory}
              onCancelEdit={() => setEditingMemory(null)}
              showToast={showToast}
            />
          </div>

          <div>
            <FilterToolbar
              summaryText={summaryText}
              helperText="Every saved moment matters."
              searchInput={searchInput}
              onSearchInputChange={(event) =>
                setSearchInput(event.target.value)
              }
              searchPlaceholder="Search memories..."
              secondaryControl={
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    gridTemplateColumns: windowWidth >= 640 ? "1fr 1fr" : "1fr",
                    width: "100%",
                  }}
                >
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    style={adminInputStyle}
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>

                  <select
                    value={filterType}
                    onChange={(event) => setFilterType(event.target.value)}
                    style={adminInputStyle}
                  >
                    <option value="all">All types</option>
                    <option value="photo">Photos</option>
                    <option value="video">Videos</option>
                    <option value="note">Notes</option>
                  </select>
                </div>
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
              <div style={adminPanelCompactStyle}>Loading memories...</div>
            ) : memories.length === 0 ? (
              <EmptyGalleryState searchQuery={searchQuery} />
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gap: "20px",
                  }}
                >
                  {memories.map((item) => (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      onView={setViewingMemory}
                      onEdit={handleEditMemory}
                      onDelete={askDeleteMemory}
                    />
                  ))}
                </div>

                <ListControls
                  showControls={showControls}
                  canLoadMore={pagination.hasMore}
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

      <MemoryViewModal
        open={Boolean(viewingMemory)}
        item={viewingMemory}
        onClose={() => setViewingMemory(null)}
      />

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
