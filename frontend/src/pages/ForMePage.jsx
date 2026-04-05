import { useMemo, useState } from "react";
import MusicList from "../components/MusicList";
import SectionTitle from "../components/SectionTitle";
import FavoriteMomentCard from "../components/FavoriteMomentCard";
import FavoriteMomentPreviewModal from "../components/FavoriteMomentPreviewModal";
import { aaronSongs } from "../data/siteContent";
import useWindowWidth from "../hooks/useWindowWidth";
import { buildUrl } from "../lib/api";
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

const rawFavoriteMoments = [
  {
    title: "Our first meet",
    caption: "One of the first moments that made everything feel real.",
    imageUrl:
      "/uploads/1773747926744-78610136-9c45328e-9698-43ba-89f5-f1b76f8764e7.jpg",
  },
  {
    title: "Just being silly together",
    caption: "A memory that felt light, easy, and full of comfort.",
    imageUrl:
      "/uploads/1773750129025-574913024-cfcf1687-bace-43db-9e4c-a1896978bb4a.jfif",
  },
  {
    title: "A little night with you",
    caption: "Some nights stay because the feeling was that soft.",
    imageUrl:
      "/uploads/1773750605328-523836133-bdd56e31-01c3-48d5-ba11-6126d549c8f5.jfif",
  },
  {
    title: "My favorite place is you",
    caption: "The kind of memory that feels peaceful every time I look back.",
    imageUrl:
      "/uploads/1773750814766-511008691-808796a5-2fdc-4cce-8287-0ab439b84620.jfif",
  },
];

function normalizeFavoriteMoment(item) {
  return {
    ...item,
    imageUrl: item?.imageUrl ? buildUrl(item.imageUrl) : "",
  };
}

export default function ForMePage({ musicCard }) {
  const [selectedMoment, setSelectedMoment] = useState(null);
  const windowWidth = useWindowWidth();
  const isNarrow = windowWidth < 1100;

  const favoriteMoments = useMemo(
    () => rawFavoriteMoments.map(normalizeFavoriteMoment),
    [],
  );

  return (
    <>
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
                person again and again. Not loud, not flashy, just real,
                constant, and full of care.
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
              <h4 style={sectionHeadingStyle}>
                Little things that feel like me
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
                  <FavoriteMomentCard
                    key={item.title}
                    item={item}
                    onOpen={setSelectedMoment}
                  />
                ))}
              </div>
            </div>

            <div style={loveNoteStyle}>
              <p style={quoteLabelStyle}>little note</p>
              <p style={loveNoteTextStyle}>
                I may be quiet, but the love I carry is deep. The more I love
                you, the more I understand that real love is not only in grand
                gestures — it is also in staying, choosing, protecting, and
                being gentle.
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

      <FavoriteMomentPreviewModal
        item={selectedMoment}
        onClose={() => setSelectedMoment(null)}
      />
    </>
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
