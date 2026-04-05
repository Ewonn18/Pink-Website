export default function MusicList({ title, songs }) {
  return (
    <div
      style={{
        borderRadius: "26px",
        border: "1px solid rgba(255,255,255,0.12)",
        background:
          "linear-gradient(180deg, rgba(48,0,24,0.55) 0%, rgba(20,0,12,0.65) 100%)",
        padding: "22px",
        boxShadow: "0 20px 46px rgba(0,0,0,0.30)",
        backdropFilter: "blur(12px)",
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
        Playlist
      </div>

      <h3
        style={{
          margin: "14px 0 0",
          fontSize: "24px",
          fontWeight: 800,
          color: "#ffe7f1",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h3>

      <div
        style={{
          marginTop: "16px",
          display: "grid",
          gap: "12px",
        }}
      >
        {songs.map((song, index) => (
          <div
            key={index}
            style={{
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              padding: "14px 16px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                color: "#ffeaf3",
                fontSize: "15px",
                lineHeight: 1.5,
              }}
            >
              {song.title}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "13px",
                color: "#ffd3e4",
                lineHeight: 1.6,
              }}
            >
              {song.artist}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
