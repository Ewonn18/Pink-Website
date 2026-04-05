import { useEffect, useState } from "react";
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
  adminPanelStyle,
  adminPanelTitleStyle,
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
  secondaryButtonStyle,
  ghostButtonStyle,
  dangerButtonStyle,
} from "../styles/buttons";

const PAGE_LIMIT = 6;

function formatMemoryDate(value) {
  try {
    return new Date(value).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function truncateFileName(name, maxLength = 32) {
  if (!name) return "No file selected";
  if (name.length <= maxLength) return name;

  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) {
    return `${name.slice(0, maxLength - 3)}...`;
  }

  const extension = name.slice(dotIndex);
  const base = name.slice(0, dotIndex);
  const allowedBaseLength = Math.max(8, maxLength - extension.length - 3);

  return `${base.slice(0, allowedBaseLength)}...${extension}`;
}

function MemoryForm({ onSuccess, editingMemory, onCancelEdit, showToast }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "photo",
  });
  const [file, setFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingMemory) {
      setForm({
        title: editingMemory.title || "",
        description: editingMemory.description || "",
        type: editingMemory.type || "photo",
      });
      setFile(null);
      setRemoveFile(false);
    } else {
      setForm({
        title: "",
        description: "",
        type: "photo",
      });
      setFile(null);
      setRemoveFile(false);
    }
  }, [editingMemory]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const hasExistingFile = Boolean(editingMemory?.fileUrl);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const isEditing = Boolean(editingMemory);

      if (isEditing) {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("type", form.type);
        formData.append("removeFile", String(removeFile));

        if (file) {
          formData.append("file", file);
        }

        const response = await fetch(
          `${API_BASE}/api/memories/${editingMemory.id}`,
          {
            method: "PUT",
            headers: getAdminHeaders(),
            body: formData,
          },
        );

        let result = null;
        try {
          result = await response.json();
        } catch {
          result = null;
        }

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Failed to update memory.");
        }
      } else {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("type", form.type);

        if (file) {
          formData.append("file", file);
        }

        const response = await fetch(`${API_BASE}/api/memories`, {
          method: "POST",
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
          throw new Error(result?.message || "Failed to upload memory.");
        }
      }

      setForm({ title: "", description: "", type: "photo" });
      setFile(null);
      setRemoveFile(false);
      onSuccess();

      showToast(
        editingMemory
          ? "Memory updated successfully."
          : "Memory uploaded successfully.",
        "success",
      );
    } catch (error) {
      showToast(error.message || "Failed to save memory.", "error");
    } finally {
      setLoading(false);
    }
  }

  const canShowFileInput = !editingMemory || form.type !== "story";
  const canReplaceFile = editingMemory && form.type !== "story";
  const canRemoveExistingFile = editingMemory && hasExistingFile;

  return (
    <form onSubmit={handleSubmit} style={adminPanelStyle}>
      <div style={adminTopBadgeStyle}>Memory Uploader</div>

      <h3 style={adminPanelTitleStyle}>
        {editingMemory ? "Edit Memory" : "Upload a Memory"}
      </h3>

      <p style={adminPanelSubtitleStyle}>
        Save photos, videos, or little love notes in one beautiful place.
      </p>

      <div style={{ display: "grid", gap: "16px", marginTop: "22px" }}>
        <div>
          <label style={adminFieldLabelStyle}>Memory title</label>
          <input
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
            style={{
              ...adminTextareaStyle,
              minHeight: "138px",
            }}
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
            <option value="story">Story</option>
          </select>
        </div>

        {canShowFileInput ? (
          <div>
            <label style={adminFieldLabelStyle}>
              {editingMemory ? "Replace file (optional)" : "Photo or video"}
            </label>

            <div style={adminFilePickerRowStyle}>
              <label style={adminFilePickerButtonStyle}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
                {editingMemory ? "Choose New File" : "Choose File"}
              </label>

              <div style={adminFileNameStyle}>
                {truncateFileName(file?.name)}
              </div>
            </div>
          </div>
        ) : null}

        {canReplaceFile && canRemoveExistingFile ? (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#ffe7f1",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <input
              type="checkbox"
              checked={removeFile}
              onChange={(event) => setRemoveFile(event.target.checked)}
            />
            Remove current attached media
          </label>
        ) : null}

        {editingMemory && form.type === "story" ? (
          <div
            style={{
              ...adminInputStyle,
              color: "#ffd8e7",
              lineHeight: 1.6,
            }}
          >
            Story memories do not keep an uploaded file. If this memory had
            media before, it will be removed when you save.
          </div>
        ) : null}

        <AdminFormActions
          isEditing={Boolean(editingMemory)}
          isLoading={loading}
          createText="Save Memory"
          createLoadingText="Uploading..."
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

function MemoryCard({ memory, onDelete, onEdit, onPreview, isWide = false }) {
  const fullFileUrl = memory.fileUrl ? `${API_BASE}${memory.fileUrl}` : "";

  return (
    <div
      className="media-card"
      style={{
        ...adminPanelStyle,
        padding: isWide ? "24px" : "22px",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={adminTypeBadgeStyle}>{memory.type}</div>

          <h3
            style={{
              margin: "14px 0 0",
              fontSize: isWide ? "30px" : "24px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#ffe8f1",
              overflowWrap: "anywhere",
            }}
          >
            {memory.title}
          </h3>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: "13px",
              color: "#ffd3e4",
              lineHeight: 1.6,
            }}
          >
            {formatMemoryDate(memory.createdAt)}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => onPreview(memory)}
            style={secondaryButtonStyle}
          >
            View
          </button>

          <button onClick={() => onEdit(memory)} style={ghostButtonStyle}>
            Edit
          </button>

          <button onClick={() => onDelete(memory.id)} style={dangerButtonStyle}>
            Delete
          </button>
        </div>
      </div>

      {memory.fileUrl && memory.type === "photo" ? (
        <div
          onClick={() => onPreview(memory)}
          style={{
            marginTop: "22px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              overflow: "hidden",
              borderRadius: "22px",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
            }}
          >
            <img
              src={fullFileUrl}
              alt={memory.title}
              loading="lazy"
              style={{
                width: "100%",
                aspectRatio: isWide ? "16 / 10.5" : "4 / 3.8",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          <div style={adminMediaHintStyle}>Tap to view full photo</div>
        </div>
      ) : null}

      {memory.fileUrl && memory.type === "video" ? (
        <div
          onClick={() => onPreview(memory)}
          style={{
            marginTop: "22px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              overflow: "hidden",
              borderRadius: "22px",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
              background: "black",
            }}
          >
            <video
              src={fullFileUrl}
              preload="metadata"
              style={{
                width: "100%",
                aspectRatio: isWide ? "16 / 10.5" : "4 / 3.8",
                objectFit: "cover",
                display: "block",
              }}
              muted
            />
          </div>

          <div style={adminMediaHintStyle}>Tap to play full video</div>
        </div>
      ) : null}

      {!memory.fileUrl && memory.type === "story" ? (
        <div
          style={{
            marginTop: "22px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "18px",
            padding: "16px",
            color: "#ffdce9",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          This is a written memory with no attached file.
        </div>
      ) : null}

      <div
        style={{
          marginTop: "18px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.05)",
          padding: isWide ? "18px" : "16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#fff0f6",
            lineHeight: 1.85,
            fontSize: isWide ? "16px" : "15px",
            overflowWrap: "anywhere",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {memory.description}
        </p>

        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#ffd8e7",
            fontWeight: 600,
          }}
        >
          Open the preview to see the full memory.
        </p>
      </div>
    </div>
  );
}

function EmptyGalleryState({ searchQuery, selectedType }) {
  const hasFilters = searchQuery.trim() || selectedType !== "all";

  return (
    <div
      style={{
        ...adminPanelStyle,
        minHeight: "260px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "28px",
      }}
    >
      <div style={{ maxWidth: "460px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 18px",
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.10)",
            fontSize: "28px",
          }}
        >
          ♡
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 800,
            color: "#ffe8f1",
          }}
        >
          {hasFilters ? "No memories matched" : "Your gallery is still empty"}
        </h3>

        <p
          style={{
            marginTop: "10px",
            fontSize: "15px",
            lineHeight: 1.7,
            color: "#ffd8e7",
          }}
        >
          {hasFilters
            ? "Try a different search word or change the selected memory type."
            : "Start with your first photo, video, or little love note and build this page into a timeline of your sweetest memories together."}
        </p>
      </div>
    </div>
  );
}

function PreviewModal({ item, onClose }) {
  if (!item) return null;

  const fullFileUrl = item.fileUrl ? `${API_BASE}${item.fileUrl}` : "";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(1000px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(48,0,24,0.95)",
          padding: "20px",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "flex-start",
            marginBottom: "16px",
            flexWrap: "wrap",
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
              {item.type}
            </p>

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
              {item.description}
            </p>
          </div>

          <button onClick={onClose} style={ghostButtonStyle}>
            Close
          </button>
        </div>

        {item.type === "photo" ? (
          <img
            src={fullFileUrl}
            alt={item.title}
            style={{
              width: "100%",
              maxHeight: "72vh",
              objectFit: "contain",
              borderRadius: "18px",
              display: "block",
              background: "rgba(0,0,0,0.18)",
            }}
          />
        ) : item.type === "video" ? (
          <video
            src={fullFileUrl}
            controls
            autoPlay
            style={{
              width: "100%",
              maxHeight: "72vh",
              borderRadius: "18px",
              display: "block",
              background: "black",
            }}
          />
        ) : (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "16px",
              padding: "16px",
              color: "#fff0f6",
            }}
          >
            A written memory with no attached file.
          </div>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage({ musicCard }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

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
  const [selectedType, setSelectedType] = useState("all");

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

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      if (selectedType !== "all") {
        params.set("type", selectedType);
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
        page: 1,
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
      console.error("Failed to fetch memories:", error);
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
  }, [searchQuery, selectedType]);

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
        throw new Error(result?.message || "Delete failed.");
      }

      if (editingMemory?.id === id) {
        setEditingMemory(null);
      }

      if (previewItem?.id === id) {
        setPreviewItem(null);
      }

      await fetchMemories(1, true);
      showToast("Memory deleted successfully.", "success");
    } catch (error) {
      showToast(error.message || "Failed to delete memory.", "error");
    } finally {
      closeConfirm();
    }
  }

  function askDeleteMemory(id) {
    openConfirm({
      title: "Delete this memory?",
      message:
        "This memory will be removed from your gallery permanently. This action cannot be undone.",
      onConfirm: () => deleteMemory(id),
    });
  }

  function handleEditMemory(memory) {
    setEditingMemory(memory);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFormSuccess() {
    setEditingMemory(null);
    await fetchMemories(1, true);
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
    setSelectedType("all");
  }

  const memoryCountText =
    pagination.total === 0
      ? "No memories yet."
      : pagination.total === 1
        ? "1 memory saved."
        : `${pagination.total} memories saved.`;

  const hasSideMusicColumn = Boolean(musicCard) && windowWidth >= 1700;
  const hasFormSidebar = windowWidth >= 1120;
  const shouldUseWideCard = memories.length === 1;

  let layoutStyle = {
    display: "grid",
    gap: "28px",
    alignItems: "start",
  };

  if (hasSideMusicColumn) {
    layoutStyle.gridTemplateColumns = "320px minmax(0, 1fr) 320px";
  } else if (hasFormSidebar) {
    layoutStyle.gridTemplateColumns = "340px minmax(0, 1fr)";
  } else {
    layoutStyle.gridTemplateColumns = "1fr";
  }

  let memoryGridStyle = {
    display: "grid",
    gap: "22px",
    alignItems: "stretch",
  };

  if (shouldUseWideCard) {
    memoryGridStyle.gridTemplateColumns = "1fr";
  } else {
    memoryGridStyle.gridTemplateColumns =
      "repeat(auto-fit, minmax(320px, 1fr))";
  }

  const canShowLess = memories.length > PAGE_LIMIT;
  const showControls = pagination.hasMore || canShowLess;
  const activeFilters = [
    ...(searchQuery ? [`Search: ${searchQuery}`] : []),
    ...(selectedType !== "all" ? [`Type: ${selectedType}`] : []),
  ];

  return (
    <>
      <section
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1580px",
          margin: "0 auto",
          padding: "48px 20px",
        }}
      >
        <SectionTitle
          title="Gallery & Memories"
          subtitle="Upload photos, videos, and little love notes to keep your story alive online."
        />

        <div style={layoutStyle}>
          <div
            style={
              hasFormSidebar ? { position: "sticky", top: "92px" } : undefined
            }
          >
            <AdminAccessPanel showToast={showToast} />

            <MemoryForm
              onSuccess={handleFormSuccess}
              editingMemory={editingMemory}
              onCancelEdit={() => setEditingMemory(null)}
              showToast={showToast}
            />
          </div>

          <div>
            <FilterToolbar
              summaryText={memoryCountText}
              helperText="Every photo tells our story."
              searchInput={searchInput}
              onSearchInputChange={(event) =>
                setSearchInput(event.target.value)
              }
              searchPlaceholder="Search memories..."
              secondaryControl={
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                  style={adminInputStyle}
                >
                  <option value="all">All types</option>
                  <option value="photo">Photos</option>
                  <option value="video">Videos</option>
                  <option value="story">Stories</option>
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
              <div style={adminPanelStyle}>Loading memories...</div>
            ) : memories.length === 0 ? (
              <EmptyGalleryState
                searchQuery={searchQuery}
                selectedType={selectedType}
              />
            ) : (
              <>
                <div style={memoryGridStyle}>
                  {memories.map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      onDelete={askDeleteMemory}
                      onEdit={handleEditMemory}
                      onPreview={setPreviewItem}
                      isWide={shouldUseWideCard}
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

          {musicCard && hasSideMusicColumn ? (
            <div style={{ position: "sticky", top: "92px" }}>{musicCard}</div>
          ) : null}
        </div>

        {musicCard && !hasSideMusicColumn ? (
          <div style={{ marginTop: "28px" }}>{musicCard}</div>
        ) : null}
      </section>

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />

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
