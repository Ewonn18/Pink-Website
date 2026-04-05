function normalizeBaseUrl(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().replace(/\/+$/, "");
}

function getApiBase() {
  const envBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

  if (envBase) {
    return envBase;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      if (port === "5173") {
        return "http://localhost:5000";
      }
      return `${protocol}//${window.location.host}`;
    }

    return "";
  }

  return "";
}

function getPublicAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return encodeURI(path);
}

export const API_BASE = getApiBase();

export const RELATIONSHIP_START_DATE = new Date(2026, 1, 13, 0, 0, 0);

export const aaronSongs = [
  { title: "Let Me", artist: "ZAYN" },
  { title: "Right Now", artist: "One Direction" },
  { title: "No Control", artist: "One Direction" },
];

export const aliyahnSongs = [
  { title: "My Angel", artist: "Adrianne Lenker" },
  { title: "Anything", artist: "Adrianne Lenker" },
  { title: "Crystalship", artist: "Cigarettes After Sex" },
  { title: "Anna Karenina", artist: "Cigarettes After Sex" },
];

export const fallbackLoveStoryTimeline = [
  {
    id: 101,
    date: "2025-11-13",
    title: "We Matched on Bumble",
    text: "At 11:38 PM, two different worlds found each other in one unexpected moment.",
  },
  {
    id: 102,
    date: "2025-11-19",
    title: "Our First Meet",
    text: "November 19, 2025 became one of the most special days in our story — the day we finally met in person and made our connection feel even more real.",
  },
  {
    id: 103,
    date: "2026-02-13",
    title: "We Became Official",
    text: "This was the day our story became official, and our love turned into something even more real, meaningful, and unforgettable.",
  },
];

export const pageMusic = {
  Home: {
    title: "Our Little Song",
    subtitle: "A melody that feels like my love for you",
    file: getPublicAssetUrl("/home-song.mp3"),
    line1:
      "You are my favorite hello, my safest place, and the softest part of my heart.",
    line2:
      "Every song here is a little reminder that loving you feels like home.",
    quote: "“Love is patient, love is kind.” — 1 Corinthians 13:4",
  },
  "Our Story": {
    title: "Our Story Song",
    subtitle: "The sound of how we began",
    file: getPublicAssetUrl("/our-story-song.mp3"),
    line1:
      "Every chapter of us is something I will always keep close to my heart.",
    line2:
      "No matter where life takes us, our story will always be one of my favorite blessings.",
    quote: "“Above all, love each other deeply.” — 1 Peter 4:8",
  },
  Gallery: {
    title: "Gallery Song",
    subtitle: "Music for our memories",
    file: getPublicAssetUrl("/gallery-song.mp3"),
    line1:
      "Every memory with you is proof that love can be both beautiful and real.",
    line2:
      "I never get tired of looking back at the moments that made me love you even more.",
    quote: "“Let all that you do be done in love.” — 1 Corinthians 16:14",
  },
  "For Her": {
    title: "Her Song",
    subtitle: "Something soft just for her",
    file: getPublicAssetUrl("/for-her-song.mp3"),
    line1: "You are one of the most beautiful gifts my heart has ever known.",
    line2:
      "The more I know you, the more grateful I become that I get to love you.",
    quote: "“I have found the one whom my soul loves.” — Song of Songs 3:4",
  },
  "For Me": {
    title: "My Song",
    subtitle: "Something calm just for me",
    file: getPublicAssetUrl("/for-me-song.mp3"),
    line1:
      "Loving you makes me want to become softer, better, and more faithful every day.",
    line2:
      "If my heart has a reason to keep choosing love, it will always be you.",
    quote: "“We love because He first loved us.” — 1 John 4:19",
  },
};
