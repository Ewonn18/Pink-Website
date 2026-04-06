import { useEffect, useRef, useState } from "react";
import { verifyAdminPasscode } from "../lib/api";
import { setAdminPasscode, setAdminModeStored } from "../utils/adminAuth";
import { ghostButtonStyle, primaryButtonStyle } from "../styles/buttons";

export default function AdminUnlockModal({ open, onClose, onUnlocked }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      setPasscode("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKey(event) {
      if (event.key === "Escape") {
        onCloseRef.current?.();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmed = passcode.trim();
    if (!trimmed) {
      setError("Enter your admin passcode.");
      return;
    }

    setLoading(true);
    try {
      const ok = await verifyAdminPasscode(trimmed);
      if (!ok) {
        setError("That passcode did not match. Try again.");
        return;
      }

      setAdminPasscode(trimmed);
      setAdminModeStored(true);
      onUnlocked?.();
      onClose?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))",
      }}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: "min(420px, 100%)",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(48,0,24,0.92), rgba(20,0,12,0.96))",
          boxShadow: "0 22px 48px rgba(0,0,0,0.4)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          padding: "24px",
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
          Private access
        </p>

        <h3
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(20px, 4vw, 24px)",
            fontWeight: 800,
            color: "#ffe8f1",
            lineHeight: 1.2,
          }}
        >
          Admin unlock
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "#ffd8e7",
            lineHeight: 1.65,
            fontSize: "14px",
          }}
        >
          Enter the admin passcode for this site. It is stored only in this
          browser after you unlock.
        </p>

        <div style={{ marginTop: "18px" }}>
          <label
            htmlFor="pink-admin-unlock-input"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#ffe2ed",
            }}
          >
            Passcode
          </label>
          <input
            id="pink-admin-unlock-input"
            type="password"
            autoComplete="off"
            enterKeyHint="done"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="••••••••"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "18px",
              padding: "14px 16px",
              outline: "none",
              fontSize: "16px",
              background: "rgba(255,255,255,0.05)",
              color: "#fff5fa",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error ? (
          <p
            style={{
              margin: "12px 0 0",
              color: "#ffc4d4",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
        ) : null}

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              ...ghostButtonStyle,
              opacity: loading ? 0.6 : 1,
              touchAction: "manipulation",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading ? 0.75 : 1,
              touchAction: "manipulation",
            }}
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
        </div>
      </form>
    </div>
  );
}
