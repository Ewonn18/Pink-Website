import { useEffect, useRef, useState } from "react";
import FloatingHearts from "./components/FloatingHearts";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import PageMusicCard from "./components/PageMusicCard";
import HomePage from "./pages/HomePage";
import StoryPage from "./pages/StoryPage";
import GalleryPage from "./pages/GalleryPage";
import ForHerPage from "./pages/ForHerPage";
import ForMePage from "./pages/ForMePage";
import { pageMusic } from "./data/siteContent";

function getInitialVolume() {
  try {
    const saved = localStorage.getItem("pink-player-volume");
    const parsed = saved ? Number(saved) : 0.8;

    if (!Number.isFinite(parsed)) return 0.8;
    if (parsed < 0) return 0;
    if (parsed > 1) return 1;

    return parsed;
  } catch {
    return 0.8;
  }
}

function getInitialMuted() {
  try {
    return localStorage.getItem("pink-player-muted") === "true";
  } catch {
    return false;
  }
}

function getInitialAdminMode() {
  try {
    return localStorage.getItem("pink-admin-mode") === "true";
  } catch {
    return false;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("Home");
  const [isLoading, setIsLoading] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState("");

  const [volume, setVolume] = useState(getInitialVolume);
  const [isMuted, setIsMuted] = useState(getInitialMuted);

  const [showAdmin, setShowAdmin] = useState(getInitialAdminMode);

  const audioRef = useRef(null);
  const currentTrack = pageMusic[currentPage];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("pink-player-volume", String(volume));
    } catch {
      // ignore
    }
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem("pink-player-muted", String(isMuted));
    } catch {
      // ignore
    }
  }, [isMuted]);

  useEffect(() => {
    try {
      localStorage.setItem("pink-admin-mode", String(showAdmin));
    } catch {
      // ignore
    }
  }, [showAdmin]);

  useEffect(() => {
    function handleAdminShortcut(event) {
      const key = String(event.key || "").toLowerCase();

      if (event.ctrlKey && event.shiftKey && key === "a") {
        event.preventDefault();
        setShowAdmin((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleAdminShortcut);

    return () => {
      window.removeEventListener("keydown", handleAdminShortcut);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    setAudioError("");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    audio.pause();
    audio.src = currentTrack.file;
    audio.currentTime = 0;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.load();
  }, [currentTrack, volume, isMuted]);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setAudioError("");
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setAudioError("The music could not start. Try clicking play again.");
    }
  }

  function handleSeek(event) {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function handleVolumeChange(event) {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);

    if (nextVolume > 0 && isMuted) {
      setIsMuted(false);
    }

    if (audioRef.current) {
      audioRef.current.volume = nextVolume;
    }
  }

  function toggleMute() {
    setIsMuted((prev) => {
      const nextMuted = !prev;

      if (audioRef.current) {
        audioRef.current.muted = nextMuted;
      }

      return nextMuted;
    });
  }

  const sharedMusicCard = (
    <PageMusicCard
      currentPage={currentPage}
      isPlaying={isPlaying}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      isMuted={isMuted}
      audioError={audioError}
      onTogglePlay={togglePlay}
      onSeek={handleSeek}
      onVolumeChange={handleVolumeChange}
      onToggleMute={toggleMute}
    />
  );

  let pageContent = (
    <HomePage musicCard={sharedMusicCard} setCurrentPage={setCurrentPage} />
  );

  if (currentPage === "Our Story") {
    pageContent = (
      <StoryPage musicCard={sharedMusicCard} showAdmin={showAdmin} />
    );
  } else if (currentPage === "Gallery") {
    pageContent = (
      <GalleryPage musicCard={sharedMusicCard} showAdmin={showAdmin} />
    );
  } else if (currentPage === "For Her") {
    pageContent = <ForHerPage musicCard={sharedMusicCard} />;
  } else if (currentPage === "For Me") {
    pageContent = <ForMePage musicCard={sharedMusicCard} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <FloatingHearts />

      <audio
        ref={audioRef}
        preload="metadata"
        hidden
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          setAudioError("");
        }}
        onCanPlay={(event) => {
          setDuration(event.currentTarget.duration || 0);
          setAudioError("");
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime || 0);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onPlay={() => {
          setIsPlaying(true);
        }}
        onError={() => {
          setIsPlaying(false);
          setAudioError("Music file could not be played.");
        }}
      />

      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main key={currentPage} className="page-transition">
        {pageContent}
      </main>

      <footer
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: "56px",
          padding: "44px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "linear-gradient(180deg, rgba(48,0,24,0.45) 0%, rgba(20,0,12,0.60) 100%)",
            boxShadow: "0 18px 44px rgba(60,0,28,0.18)",
            backdropFilter: "blur(10px)",
            padding: "28px 22px",
            textAlign: "center",
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
            made with love
          </div>

          <p
            style={{
              fontSize: "26px",
              fontWeight: 900,
              letterSpacing: "0.20em",
              color: "#ffe4ef",
              margin: "16px 0 0",
            }}
          >
            PINK
          </p>

          <p
            style={{
              marginTop: "14px",
              fontSize: "15px",
              fontWeight: 500,
              lineHeight: 1.8,
              color: "#ffe8f1",
              maxWidth: "760px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Made with love, for the girl who made my world softer, brighter, and
            more beautiful.
          </p>

          <div
            style={{
              marginTop: "18px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <span style={footerPillStyle}>Our story</span>
            <span style={footerPillStyle}>Our songs</span>
            <span style={footerPillStyle}>Our memories</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const footerPillStyle = {
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  padding: "9px 14px",
  fontWeight: 700,
  color: "#ffe7f1",
  fontSize: "13px",
};
