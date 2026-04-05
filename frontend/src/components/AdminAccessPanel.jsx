import { useState } from "react";
import {
  getAdminPasscode,
  setAdminPasscode,
  clearAdminPasscode,
} from "../utils/adminAuth";

export default function AdminAccessPanel({ showToast }) {
  const [passcode, setPasscodeValue] = useState(() => getAdminPasscode());
  const [saved, setSaved] = useState(Boolean(getAdminPasscode()));

  function handleSave() {
    const cleanValue = passcode.trim();
    setAdminPasscode(cleanValue);
    setSaved(Boolean(cleanValue));

    if (showToast) {
      showToast(
        cleanValue
          ? "Admin passcode saved in this browser."
          : "Admin passcode cleared.",
        "success",
      );
    }
  }

  function handleClear() {
    setPasscodeValue("");
    clearAdminPasscode();
    setSaved(false);

    if (showToast) {
      showToast("Saved admin passcode removed from this browser.", "success");
    }
  }

  return (
    <div
      style={{
        borderRadius: "28px",
        border: "1px solid rgba(255,255,255,0.12)",
        background:
          "linear-gradient(180deg, rgba(48,0,24,0.55), rgba(20,0,12,0.65))",
        padding: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)",
        marginBottom: "18px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "7px 11px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "#ffd8e7",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Admin Access
      </div>

      <h3
        style={{
          margin: "14px 0 0",
          fontSize: "24px",
          fontWeight: 800,
          lineHeight: 1.15,
          color: "#ffe8f1",
        }}
      >
        Admin passcode
      </h3>

      <p
        style={{
          marginTop: "10px",
          color: "#ffd8e7",
          lineHeight: 1.7,
          fontSize: "15px",
        }}
      >
        Enter your backend admin passcode here. It will be stored only in this
        browser and sent only for admin actions.
      </p>

      <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
        <div>
          <label
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
            type="password"
            value={passcode}
            onChange={(event) => setPasscodeValue(event.target.value)}
            placeholder="Enter admin passcode"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "18px",
              padding: "14px 16px",
              outline: "none",
              fontSize: "15px",
              background: "rgba(255,255,255,0.04)",
              color: "#fff5fa",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              border: "none",
              borderRadius: "18px",
              padding: "14px 16px",
              background: "linear-gradient(180deg, #ff5ea2, #ff2e86)",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(255,46,134,0.35)",
            }}
          >
            Save Passcode
          </button>

          <button
            type="button"
            onClick={handleClear}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              padding: "13px 14px",
              background: "rgba(255,255,255,0.05)",
              color: "#fff1f7",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#ffd8e7",
            lineHeight: 1.6,
          }}
        >
          Status: {saved ? "saved in this browser" : "not saved yet"}
        </p>
      </div>
    </div>
  );
}
