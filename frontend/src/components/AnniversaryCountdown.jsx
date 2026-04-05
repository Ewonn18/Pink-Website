import { useEffect, useState } from "react";
import { RELATIONSHIP_START_DATE } from "../data/siteContent";
import SectionTitle from "./SectionTitle";

function getNextAnniversaryDate() {
  const now = new Date();

  let nextAnniversary = new Date(
    now.getFullYear(),
    RELATIONSHIP_START_DATE.getMonth(),
    RELATIONSHIP_START_DATE.getDate(),
    0,
    0,
    0,
  );

  if (now > nextAnniversary) {
    nextAnniversary = new Date(
      now.getFullYear() + 1,
      RELATIONSHIP_START_DATE.getMonth(),
      RELATIONSHIP_START_DATE.getDate(),
      0,
      0,
      0,
    );
  }

  return nextAnniversary;
}

export default function AnniversaryCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = getNextAnniversaryDate();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  const nextAnniversary = getNextAnniversaryDate();
  const anniversaryText = nextAnniversary.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const boxes = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section
      style={{
        position: "relative",
        zIndex: 10,
        padding: "0 16px 34px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          borderRadius: "34px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(48,0,24,0.42)",
          padding: "clamp(20px, 4vw, 28px)",
          boxShadow: "0 16px 40px rgba(72,0,32,0.24)",
          backdropFilter: "blur(10px)",
        }}
      >
        <SectionTitle
          title="Next Anniversary Countdown"
          subtitle={`Counting down to ${anniversaryText} — another beautiful chapter of us.`}
        />

        <div
          style={{
            display: "grid",
            gap: "14px",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          }}
        >
          {boxes.map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                padding: "clamp(18px, 4vw, 24px)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "clamp(32px, 8vw, 48px)",
                  fontWeight: 900,
                  color: "#ffe8f1",
                  lineHeight: 1,
                }}
              >
                {String(item.value).padStart(2, "0")}
              </p>
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#ffd0e2",
                }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
