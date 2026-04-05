import { useEffect, useMemo, useState } from "react";
import SectionTitle from "../components/SectionTitle";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import FilterToolbar from "../components/FilterToolbar";
import ListControls from "../components/ListControls";
import AdminFormActions from "../components/AdminFormActions";
import AdminAccessPanel from "../components/AdminAccessPanel";
import { API_BASE } from "../data/siteContent";
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
  adminFilePickerRowStyle,
  adminFilePickerButtonStyle,
  adminFileNameStyle,
  adminTypeBadgeStyle,
  adminMediaHintStyle,
} from "../styles/adminForm";
import {
  primaryButtonStyle,
  ghostButtonStyle,
  dangerButtonStyle,
} from "../styles/buttons";

const PAGE_LIMIT = 6;

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

function getItemMediaUrl(item) {
  if (!item || typeof item !== "object") return "";

  const possibleUrl =
    item.fileUrl ||
    item.mediaUrl ||
    item.cloudinaryUrl ||
    item.url ||
    item.secure_url ||
    item.imageUrl ||
    item.videoUrl ||
    item.assetUrl ||
    item.previewUrl ||
    item?.asset?.url ||
    item?.asset?.secure_url ||
    "";

  return buildMediaUrl(possibleUrl);
}

function isVideoItem(item) {
  const explicitType = String(item?.type || "").toLowerCase();
  if (explicitType === "video") return true;
  if (explicitType === "photo") return false;

  const url = getItemMediaUrl(item).toLowerCase();
  return [".mp4", ".webm", ".ogg", ".mov", ".m4v"].some((ext) =>
    url.includes(ext),
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
          ? "Try a different search word."
          : "Start with your first photo, video, or little love note and build this page into a timeline of your sweetest memories together."}
      </p>
    </div>
  );
}

function GalleryForm({
  onSuccess,
  editingItem,
  onCancelEdit,
  showToast,
  showAdmin,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "photo",
    file: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title || "",
        description: editingItem.description || "",
        type: editingItem.type || "photo",
        file: null,
      });
    } else {
      setForm({
        title: "",
        description: "",
        type: "photo",
        file: null,
      });
    }
  }, [editingItem]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({
      ...prev,
      file,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!showAdmin) {
      showToast("Admin access is hidden on this deployment.", "error");
      return;
    }

    try {
      setSubmitting(true);

      const isEditing = Boolean(editingItem);
      const endpoint = isEditing
        ? `${API_BASE}/api/memories/${editingItem.id}`
        : `${API_BASE}/api/memories`;

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("type", form.type);

      if (form.file) {
        formData.append("file", form.file);
      }

      const response = await fetch(endpoint, {
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
        file: null,
      });

      onSuccess();

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

  if (!showAdmin) return null;

  return (
    <form onSubmit={handleSubmit} style={adminPanelCompactStyle}>
      <div style={adminTopBadgeStyle}>Memory Uploader</div>

      <h3 style={adminPanelTitleWithTopMarginStyle}>
        {editingItem ? "Edit Memory" : "Upload a Memory"}
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
          </select>
        </div>

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
              {form.file
                ? form.file.name
                : editingItem
                  ? "Keep current uploaded file"
                  : "No file selected"}
            </div>
          </div>

          <div style={adminMediaHintStyle}>
            {form.type === "video"
              ? "Upload an MP4, MOV, or WebM video."
              : "Upload a JPG, PNG, WEBP, or similar image."}
          </div>
        </div>

        <AdminFormActions
          isEditing={Boolean(editingItem)}
          isLoading={submitting}
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

function GalleryCard({ item, onOpen, onEdit, onDelete, showAdmin }) {
  const mediaUrl = getItemMediaUrl(item);
  const isVideo = isVideoItem(item);
  const [mediaFailed, setMediaFailed] = useState(false);

  return (
    <div
      style={{
        ...adminPanelCompactStyle,
        padding: "22px",
        display: "grid",
        gap: "16px",
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
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={adminTypeBadgeStyle}>{item.type || "photo"}</div>

          <h3
            style={{
              margin: "14px 0 0",
              fontSize: "24px",
              fontWeight: 800,
              color: "#ffe8f1",
              lineHeight: 1.15,
            }}
          >
            {item.title}
          </h3>

          <p
            style={{
              margin: "10px 0 0",
              color: "#ffd8e7",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            {item.createdAt
              ? new Date(item.createdAt).toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Saved memory"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => onOpen(item)} style={ghostButtonStyle}>
            View
          </button>

          {showAdmin ? (
            <>
              <button onClick={() => onEdit(item)} style={ghostButtonStyle}>
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                style={dangerButtonStyle}
              >
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div
        style={{
          overflow: "hidden",
          borderRadius: "22px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {!mediaUrl || mediaFailed ? (
          <div
            style={{
              minHeight: "320px",
              display: "grid",
              placeItems: "center",
              padding: "20px",
              color: "#ffd8e7",
              textAlign: "center",
              lineHeight: 1.7,
            }}
          >
            Media preview unavailable.
          </div>
        ) : isVideo ? (
          <video
            controls
            preload="metadata"
            style={{
              width: "100%",
              display: "block",
              maxHeight: "520px",
              objectFit: "cover",
              background: "#1b0010",
            }}
            onError={() => setMediaFailed(true)}
          >
            <source src={mediaUrl} />
          </video>
        ) : (
          <img
            src={mediaUrl}
            alt={item.title || "Memory"}
            style={{
              width: "100%",
              display: "block",
              maxHeight: "520px",
              objectFit: "cover",
              background: "#1b0010",
            }}
            onError={() => setMediaFailed(true)}
          />
        )}
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          width: "fit-content",
          padding: "8px 12px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.05)",
          color: "#ffe7f1",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {isVideo ? "Tap to play full video" : "Tap to view full photo"}
      </div>

      <div
        style={{
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          padding: "18px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#fff0f6",
            lineHeight: 1.85,
            fontSize: "15px",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {item.description}
        </p>

        <p
          style={{
            margin: "12px 0 0",
            color: "#ffd8e7",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          Open the preview to see the full memory.
        </p>
      </div>
    </div>
  );
}

function PreviewModal({ item, onClose }) {
  const mediaUrl = getItemMediaUrl(item);
  const isVideo = isVideoItem(item);

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(10,0,6,0.78)",
        backdropFilter: "blur(8px)",
        padding: "24px",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        className="moment-modal-card"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(1000px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(48,0,24,0.80), rgba(20,0,12,0.86))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.42)",
          padding: "22px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={adminTypeBadgeStyle}>{item.type || "photo"}</div>
            <h3
              style={{
                margin: "12px 0 0",
                fontSize: "30px",
                lineHeight: 1.1,
                fontWeight: 900,
                color: "#ffe8f1",
              }}
            >
              {item.title}
            </h3>
          </div>

          <button onClick={onClose} style={ghostButtonStyle}>
            Close
          </button>
        </div>

        <div
          style={{
            marginTop: "18px",
            overflow: "hidden",
            borderRadius: "22px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {isVideo ? (
            <video
              controls
              preload="metadata"
              style={{
                width: "100%",
                display: "block",
                maxHeight: "70vh",
                objectFit: "contain",
                background: "#1b0010",
              }}
            >
              <source src={mediaUrl} />
            </video>
          ) : (
            <img
              src={mediaUrl}
              alt={item.title || "Memory"}
              style={{
                width: "100%",
                display: "block",
                maxHeight: "70vh",
                objectFit: "contain",
                background: "#1b0010",
              }}
            />
          )}
        </div>

        <p
          style={{
            margin: "18px 0 0",
            color: "#fff0f6",
            lineHeight: 1.9,
            fontSize: "15px",
            whiteSpace: "pre-wrap",
          }}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default function GalleryPage({ musicCard, showAdmin = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });

  async function fetchItems(page = 1, shouldReplace = false) {
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

      setItems((prev) => (shouldReplace ? nextItems : [...prev, ...nextItems]));
      setPagination(nextPagination);
    } catch (error) {
      if (page === 1) {
        setItems([]);
      }
      showToast(error.message || "Failed to fetch memories.", "error");
    } finally {
      if (page === 1) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchItems(1, true);
  }, [searchQuery, sortOrder]);

  async function handleFormSuccess() {
    setEditingItem(null);
    await fetchItems(1, true);
  }

  function askDeleteItem(id) {
    openConfirm({
      title: "Delete this memory?",
      message:
        "This memory will be removed permanently. This action cannot be undone.",
      onConfirm: () => deleteItem(id),
    });
  }

  async function deleteItem(id) {
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

      if (editingItem?.id === id) {
        setEditingItem(null);
      }

      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }

      await fetchItems(1, true);
      showToast("Memory deleted successfully.", "success");
    } catch (error) {
      showToast(error.message || "Failed to delete memory.", "error");
    } finally {
      closeConfirm();
    }
  }

  function handleEditItem(item) {
    if (!showAdmin) return;
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLoadMore() {
    if (!pagination.hasMore) return;
    await fetchItems(pagination.page + 1, false);
  }

  async function handleShowLess() {
    await fetchItems(1, true);
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
  }

  const isDesktop = windowWidth >= 1220;
  const isTablet = windowWidth >= 860 && windowWidth < 1220;

  const layoutStyle = useMemo(() => {
    const style = {
      display: "grid",
      gap: "24px",
      alignItems: "start",
    };

    if (isDesktop) {
      style.gridTemplateColumns = showAdmin
        ? musicCard
          ? "320px minmax(0, 1fr) 340px"
          : "320px minmax(0, 1fr)"
        : musicCard
          ? "minmax(0, 1fr) 340px"
          : "1fr";
    } else if (isTablet) {
      style.gridTemplateColumns = showAdmin ? "300px minmax(0, 1fr)" : "1fr";
    } else {
      style.gridTemplateColumns = "1fr";
    }

    return style;
  }, [isDesktop, isTablet, musicCard, showAdmin]);

  const canShowLess = items.length > PAGE_LIMIT;
  const showControls = pagination.hasMore || canShowLess;

  const summaryText =
    pagination.total === 0
      ? "No memories yet."
      : pagination.total === 1
        ? "1 memory saved."
        : `${pagination.total} memories saved.`;

  const activeFilters = [
    ...(searchQuery ? [`Search: ${searchQuery}`] : []),
    `Sort: ${sortOrder === "asc" ? "oldest first" : "newest first"}`,
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
          title="Gallery"
          subtitle="A collection of photos, videos, and little love notes worth keeping close."
        />

        <div style={layoutStyle}>
          {showAdmin ? (
            <div
              style={
                isDesktop ? { position: "sticky", top: "92px" } : undefined
              }
            >
              <AdminAccessPanel showToast={showToast} />
              <GalleryForm
                onSuccess={handleFormSuccess}
                editingItem={editingItem}
                onCancelEdit={() => setEditingItem(null)}
                showToast={showToast}
                showAdmin={showAdmin}
              />
            </div>
          ) : null}

          <div>
            <FilterToolbar
              summaryText={summaryText}
              helperText="Every saved memory matters."
              searchInput={searchInput}
              onSearchInputChange={(event) =>
                setSearchInput(event.target.value)
              }
              searchPlaceholder="Search memories..."
              secondaryControl={
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  style={adminInputStyle}
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
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
              <div style={adminPanelCompactStyle}>Loading memories...</div>
            ) : items.length === 0 ? (
              <EmptyGalleryState searchQuery={searchQuery} />
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gap: "20px",
                  }}
                >
                  {items.map((item) => (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      onOpen={setSelectedItem}
                      onEdit={handleEditItem}
                      onDelete={askDeleteItem}
                      showAdmin={showAdmin}
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

      <PreviewModal item={selectedItem} onClose={() => setSelectedItem(null)} />

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
