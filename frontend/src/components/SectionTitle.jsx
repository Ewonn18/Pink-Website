export default function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "32px", textAlign: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 14px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(72,0,34,0.36)",
          color: "#ffd2e4",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          boxShadow: "0 10px 24px rgba(56,0,24,0.16)",
          backdropFilter: "blur(10px)",
        }}
      >
        pink
      </div>

      <h2
        style={{
          margin: "14px 0 0",
          fontSize: "clamp(30px, 6vw, 40px)",
          fontWeight: 800,
          color: "#ffe8f1",
          lineHeight: 1.08,
          textShadow: "0 6px 18px rgba(40,0,16,0.18)",
        }}
      >
        {title}
      </h2>

      {subtitle ? (
        <p
          style={{
            marginTop: "12px",
            fontSize: "clamp(14px, 2.5vw, 16px)",
            color: "#ffd8e7",
            maxWidth: "760px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.8,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
