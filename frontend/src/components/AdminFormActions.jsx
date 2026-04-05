export default function AdminFormActions({
  isEditing = false,
  isLoading = false,
  createText = "Save",
  createLoadingText = "Saving...",
  editText = "Save Changes",
  editLoadingText = "Saving...",
  onCancel,
  buttonStyle,
  ghostButtonStyle,
}) {
  const submitLabel = isLoading
    ? isEditing
      ? editLoadingText
      : createLoadingText
    : isEditing
      ? editText
      : createText;

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      <button type="submit" disabled={isLoading} style={buttonStyle}>
        {submitLabel}
      </button>

      {isEditing ? (
        <button type="button" onClick={onCancel} style={ghostButtonStyle}>
          Cancel
        </button>
      ) : null}
    </div>
  );
}
