import MusicList from "../components/MusicList";
import SectionTitle from "../components/SectionTitle";
import { aliyahnSongs } from "../data/siteContent";
import useWindowWidth from "../hooks/useWindowWidth";
import {
  glassPanelStyle,
  glassPanelSoftStyle,
  infoPillStyle,
} from "../styles/ui";

const detailItems = [
  ["Birthday", "December 2, 2006"],
  ["Personality", "Adventurous, expressive, and bold"],
  ["Interests", "Motorcycles, big bikes, piano, music, and new experiences"],
  [
    "Vibe",
    "The kind of soul who brings movement, music, and excitement into every moment",
  ],
];

const favoriteThings = [
  ["Favorite vibe", "Late-night rides and soft music"],
  ["Favorite music energy", "Emotional, dreamy, and intimate songs"],
  ["Favorite kind of day", "A day that feels free, exciting, and full of life"],
  [
    "Favorite kind of moment",
    "The ones that feel alive, spontaneous, and real",
  ],
];

const aestheticTags = [
  "sunset rides",
  "soft chaos",
  "piano nights",
  "pink skies",
  "fearless heart",
  "city lights",
  "wild soul",
  "sweet danger",
];

const favoriteMoments = [
  {
    title: "Our first meet",
    caption: "The kind of moment that made everything feel more real.",
    note: "The first moment that made everything feel softer and more meaningful.",
  },
  {
    title: "One ride I still replay",
    caption: "A simple memory that somehow stayed soft and unforgettable.",
    note: "Some memories stay because they felt alive, calm, and full of you.",
  },
  {
    title: "A little sunshine with you",
    caption: "You make even the lightest moments feel warm and full.",
    note: "Even the smallest moments feel brighter when you are part of them.",
  },
  {
    title: "That peaceful sunset day",
    caption: "Somewhere between the view and you, everything felt right.",
    note: "A quiet kind of peace I still remember every time I think of you.",
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

export default function ForHerPage({ musicCard }) {
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
        title="For Her"
        subtitle="A page for Aliyahn — fearless, expressive, adventurous, and impossible not to admire."
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
            <div style={eyebrowStyle}>for the girl i love</div>

            <h3
              style={{
                margin: "14px 0 0",
                fontSize: isNarrow ? "32px" : "42px",
                lineHeight: 1.02,
                fontWeight: 900,
                color: "#ffe8f1",
              }}
            >
              Aliyahn Rain Malandac
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
              You are one of the brightest parts of my world — full of life,
              full of feeling, and full of moments I never want to forget. This
              page is a small reminder of how beautiful you are, not just in the
              way you look, but in the way you move, dream, speak, and live.
            </p>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <span style={pillStyle}>Fearless</span>
              <span style={pillStyle}>Expressive</span>
              <span style={pillStyle}>Adventurous</span>
              <span style={pillStyle}>Unforgettable</span>
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
            <h4 style={sectionHeadingStyle}>Her aesthetic</h4>

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
            <h4 style={sectionHeadingStyle}>
              Little things that feel like her
            </h4>

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
              Loving you feels like loving someone full of color, movement, and
              music. You make everything feel more alive, and even the ordinary
              moments become special when they include you.
            </p>
          </div>

          <MusicList title="Her Favorite Music" songs={aliyahnSongs} />
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
