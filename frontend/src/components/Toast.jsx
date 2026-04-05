export default function Toast({ open, message, type = "success", onClose }) {
  if (!open) return null;

  const isError = type === "error";

  return (
    <div
      className="toast-enter"
      style={{
        position: "fixed",
        right: "16px",
        bottom: "16px",
        zIndex: 1200,
        width: "min(420px, calc(100vw - 32px))",
        borderRadius: "18px",
        border: "1px solid rgba(255,255,255,0.12)",
        background: isError
          ? "rgba(110, 20, 50, 0.96)"
          : "rgba(48, 0, 24, 0.96)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
        backdropFilter: "blur(10px)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isError ? "#ffd4dd" : "#ffd2e4",
            }}
          >
            {isError ? "Something went wrong" : "Done"}
          </p>

          <p
            style={{
              margin: "8px 0 0",
              color: "#fff1f7",
              lineHeight: 1.6,
              fontSize: "14px",
              wordBreak: "break-word",
            }}
          >
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            color: "#fff1f7",
            padding: "8px 10px",
            cursor: "pointer",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
