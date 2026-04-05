import MusicList from "../components/MusicList";
import SectionTitle from "../components/SectionTitle";
import { aaronSongs } from "../data/siteContent";
import useWindowWidth from "../hooks/useWindowWidth";
import {
  glassPanelStyle,
  glassPanelSoftStyle,
  infoPillStyle,
} from "../styles/ui";

const detailItems = [
  ["Birthday", "March 18, 2002"],
  ["Personality", "Homeboy, focused, chill, and caring"],
  ["Interests", "Gaming, staying at home, gym, music, and quiet quality time"],
  [
    "Vibe",
    "The kind of love that stays soft, sincere, and strong through time",
  ],
];

const favoriteThings = [
  ["Favorite vibe", "Quiet nights, music, and peace"],
  ["Favorite music energy", "Soft, romantic, and heartfelt songs"],
  ["Favorite kind of day", "A calm day at home with the right person"],
  ["Favorite kind of moment", "Simple moments that feel safe and real"],
];

const aestheticTags = [
  "quiet love",
  "late night talks",
  "soft playlists",
  "homebody heart",
  "calm energy",
  "gentle soul",
  "steady love",
  "loyal heart",
];

const favoriteMoments = [
  {
    title: "Our first meet",
    caption: "One of the first moments that made everything feel real.",
    note: "A memory that still feels soft every time I look back at it.",
  },
  {
    title: "Just being silly together",
    caption: "A memory that felt light, easy, and full of comfort.",
    note: "The kind of moment that proves love can be simple and safe.",
  },
  {
    title: "A little night with you",
    caption: "Some nights stay because the feeling was that soft.",
    note: "Quiet nights with you always feel heavier in the heart in the best way.",
  },
  {
    title: "My favorite place is you",
    caption: "The kind of memory that feels peaceful every time I look back.",
    note: "No matter where we are, the best part is always being with you.",
  },
];

function FavoriteTextMomentCard({ item }) {
  return (
    <div style={momentCardStyle}>
      <div style={momentBadgeStyle}>favorite memory</div>

      <h5 style={momentTitleStyle}>{item.title}</h5>
      <p style={momentCaptionStyle}>{item.caption}</p>

      <div style={momentNoteWrapStyle}>
        <p style={momentNoteStyle}>{item.note}</p>
      </div>
    </div>
  );
}

export default function ForMePage({ musicCard }) {
  const windowWidth = useWindowWidth();
  const isNarrow = windowWidth < 1100;

  return (
    <section
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1380px",
        margin: "0 auto",
        padding: "48px 16px",
      }}
    >
      <SectionTitle
        title="For Me"
        subtitle="A page for Aaron — calm, loyal, steady, and full of quiet love."
      />

      <div
        style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: isNarrow
            ? "1fr"
            : musicCard
              ? "minmax(0, 1fr) 340px"
              : "1fr",
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: "20px" }}>
          <div style={heroCardStyle}>
            <div style={eyebrowStyle}>a quiet kind of love</div>

            <h3
              style={{
                margin: "14px 0 0",
                fontSize: isNarrow ? "32px" : "42px",
                lineHeight: 1.02,
                fontWeight: 900,
                color: "#ffe8f1",
              }}
            >
              Aaron John Aquino
            </h3>

            <p
              style={{
                marginTop: "16px",
                maxWidth: "760px",
                color: "#fff0f6",
                lineHeight: 1.85,
                fontSize: "16px",
              }}
            >
              This page carries the softer parts of me — the steady kind of
              love, the quiet loyalty, and the heart that keeps choosing one
              person again and again. Not loud, not flashy, just real, constant,
              and full of care.
            </p>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <span style={pillStyle}>Calm</span>
              <span style={pillStyle}>Steady</span>
              <span style={pillStyle}>Faithful</span>
              <span style={pillStyle}>Sincere</span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "14px",
              gridTemplateColumns: isNarrow
                ? "1fr"
                : "repeat(2, minmax(0, 1fr))",
            }}
          >
            {detailItems.map(([label, value]) => (
              <div key={label} style={infoCardStyle}>
                <p style={labelStyle}>{label}</p>
                <p style={valueStyle}>{value}</p>
              </div>
            ))}
          </div>

          <div style={sectionCardStyle}>
            <p style={quoteLabelStyle}>mood board</p>
            <h4 style={sectionHeadingStyle}>My aesthetic</h4>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {aestheticTags.map((tag) => (
                <span key={tag} style={tagStyle}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={sectionCardStyle}>
            <p style={quoteLabelStyle}>favorite things</p>
            <h4 style={sectionHeadingStyle}>Little things that feel like me</h4>

            <div
              style={{
                marginTop: "16px",
                display: "grid",
                gap: "14px",
                gridTemplateColumns: isNarrow
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
              }}
            >
              {favoriteThings.map(([label, value]) => (
                <div key={label} style={favoriteCardStyle}>
                  <p style={labelStyle}>{label}</p>
                  <p style={valueStyle}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionCardStyle}>
            <p style={quoteLabelStyle}>favorite moments with you</p>
            <h4 style={sectionHeadingStyle}>Little memories I keep close</h4>

            <div
              style={{
                marginTop: "16px",
                display: "grid",
                gap: "16px",
                gridTemplateColumns: isNarrow
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
              }}
            >
              {favoriteMoments.map((item) => (
                <FavoriteTextMomentCard key={item.title} item={item} />
              ))}
            </div>
          </div>

          <div style={loveNoteStyle}>
            <p style={quoteLabelStyle}>little note</p>
            <p style={loveNoteTextStyle}>
              I may be quiet, but the love I carry is deep. The more I love you,
              the more I understand that real love is not only in grand gestures
              — it is also in staying, choosing, protecting, and being gentle.
            </p>
          </div>

          <MusicList title="My Favorite Music" songs={aaronSongs} />
        </div>

        {musicCard ? (
          <div
            style={isNarrow ? undefined : { position: "sticky", top: "92px" }}
          >
            {musicCard}
          </div>
        ) : null}
      </div>
    </section>
  );
}

const heroCardStyle = {
  ...glassPanelStyle,
  borderRadius: "28px",
  padding: "26px",
  boxShadow: "0 18px 46px rgba(0,0,0,0.30)",
};

const infoCardStyle = {
  borderRadius: "22px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.05)",
  padding: "18px",
};

const favoriteCardStyle = {
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.05)",
  padding: "18px",
};

const sectionCardStyle = {
  ...glassPanelSoftStyle,
};

const loveNoteStyle = {
  ...glassPanelSoftStyle,
};

const eyebrowStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.20em",
  textTransform: "uppercase",
  color: "#ffd2e4",
};

const labelStyle = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#ffd2e4",
};

const valueStyle = {
  margin: "8px 0 0",
  color: "#fff0f6",
  lineHeight: 1.75,
  fontSize: "15px",
};

const quoteLabelStyle = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#ffd2e4",
};

const sectionHeadingStyle = {
  margin: "10px 0 0",
  color: "#ffe8f1",
  fontSize: "24px",
  fontWeight: 800,
  lineHeight: 1.2,
};

const loveNoteTextStyle = {
  margin: "10px 0 0",
  color: "#fff0f6",
  lineHeight: 1.85,
  fontSize: "15px",
};

const pillStyle = {
  ...infoPillStyle,
};

const tagStyle = {
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.05)",
  padding: "10px 14px",
  color: "#ffe7f1",
  fontWeight: 700,
  fontSize: "13px",
  textTransform: "lowercase",
};

const momentCardStyle = {
  borderRadius: "22px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.05)",
  padding: "18px",
  display: "grid",
  gap: "12px",
};

const momentBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "7px 10px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#ffd8e7",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const momentTitleStyle = {
  margin: 0,
  color: "#ffe8f1",
  fontSize: "22px",
  fontWeight: 800,
  lineHeight: 1.2,
};

const momentCaptionStyle = {
  margin: 0,
  color: "#fff0f6",
  fontSize: "15px",
  lineHeight: 1.75,
};

const momentNoteWrapStyle = {
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  padding: "14px",
};

const momentNoteStyle = {
  margin: 0,
  color: "#ffdce9",
  fontSize: "14px",
  lineHeight: 1.7,
};
