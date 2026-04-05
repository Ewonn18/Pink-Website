export default function FloatingHearts() {
  const hearts = [
    { left: "6%", delay: "0s", duration: "10s", size: "18px" },
    { left: "14%", delay: "2s", duration: "12s", size: "24px" },
    { left: "24%", delay: "4s", duration: "11s", size: "16px" },
    { left: "38%", delay: "1s", duration: "13s", size: "20px" },
    { left: "52%", delay: "3s", duration: "12s", size: "22px" },
    { left: "66%", delay: "5s", duration: "14s", size: "18px" },
    { left: "78%", delay: "2.5s", duration: "11s", size: "26px" },
    { left: "90%", delay: "6s", duration: "13s", size: "17px" },
  ];

  return (
    <div
      style={{
        pointerEvents: "none",
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {hearts.map((heart, index) => (
        <span
          key={index}
          className="floating-heart"
          style={{
            position: "absolute",
            left: heart.left,
            bottom: "-40px",
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            fontSize: heart.size,
            color: "rgba(255,255,255,0.55)",
            textShadow: "0 0 14px rgba(255, 182, 213, 0.9)",
            animationName: "floatHeart",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            userSelect: "none",
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
