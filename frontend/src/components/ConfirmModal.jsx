export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDanger = false,
}) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "rgba(0,0,0,0.68)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="confirm-modal-card"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(460px, 100%)",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(48,0,24,0.96)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.32)",
          backdropFilter: "blur(12px)",
          padding: "22px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#ffd2e4",
          }}
        >
          Confirmation
        </p>

        <h3
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(22px, 4vw, 26px)",
            fontWeight: 800,
            color: "#ffe8f1",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: "12px 0 0",
            color: "#fff0f6",
            lineHeight: 1.7,
            fontSize: "15px",
          }}
        >
          {message}
        </p>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button onClick={onCancel} style={ghostButtonStyle}>
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            style={isDanger ? dangerButtonStyle : primaryButtonStyle}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const ghostButtonStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
  padding: "12px 16px",
  background: "rgba(255,255,255,0.05)",
  color: "#fff1f7",
  fontWeight: 700,
  cursor: "pointer",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: "16px",
  padding: "12px 16px",
  background: "linear-gradient(180deg, #ff5ea2 0%, #ff2e86 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const dangerButtonStyle = {
  border: "none",
  borderRadius: "16px",
  padding: "12px 16px",
  background: "linear-gradient(180deg, #ff7aa8 0%, #ff4d8d 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
