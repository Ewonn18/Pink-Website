import { ghostButtonStyle } from "../styles/buttons";

export default function AdminModeBadge({ onExitAdmin }) {
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: "max(16px, env(safe-area-inset-bottom))",
        right: "max(16px, env(safe-area-inset-right))",
        left: "auto",
        zIndex: 1600,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        maxWidth: "min(420px, calc(100vw - 32px))",
        padding: "12px 14px",
        borderRadius: "999px",
        border: "1px solid rgba(255,255,255,0.14)",
        background:
          "linear-gradient(135deg, rgba(82, 7, 42, 0.85), rgba(48, 0, 24, 0.92))",
        boxShadow: "0 14px 36px rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#ffd8e7",
        }}
      >
        Admin mode
      </span>

      <button
        type="button"
        onClick={onExitAdmin}
        style={{
          ...ghostButtonStyle,
          padding: "10px 14px",
          fontSize: "13px",
          borderRadius: "999px",
          touchAction: "manipulation",
          minHeight: "44px",
        }}
      >
        Exit admin mode
      </button>
    </div>
  );
}
