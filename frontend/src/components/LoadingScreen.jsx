export default function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.35), transparent 28%), linear-gradient(180deg, #ffd6e7 0%, #ffc1da 45%, #ffb0d1 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "min(540px, 100%)",
          textAlign: "center",
          padding: "30px 24px",
          borderRadius: "30px",
          border: "1px solid rgba(255,255,255,0.30)",
          background: "rgba(255,255,255,0.14)",
          boxShadow: "0 24px 60px rgba(120, 20, 70, 0.14)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="loading-glow"
          style={{
            fontSize: "clamp(56px, 9vw, 100px)",
            fontWeight: 900,
            letterSpacing: "0.35em",
            color: "#c2185b",
            paddingLeft: "0.35em",
          }}
        >
          PINK
        </div>

        <p
          style={{
            marginTop: "18px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#9a2e61",
          }}
        >
          Preparing our sweetest little corner
        </p>

        <div
          style={{
            marginTop: "18px",
            width: "100%",
            height: "8px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.36)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "42%",
              height: "100%",
              borderRadius: "999px",
              background: "linear-gradient(90deg, #ff77ad 0%, #ff2e86 100%)",
              animation: "loadingBar 1.4s ease-in-out infinite",
            }}
          />
        </div>

        <div
          style={{
            marginTop: "18px",
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.28)",
            color: "#8f2f5d",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          made with love, just for you
        </div>
      </div>
    </div>
  );
}
