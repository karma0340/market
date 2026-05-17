"use client";

import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";

const ANIMATION_MAP = {
  idle:    "/animations/character-idle.json",
  typing:  "/animations/character-typing.json",
  loading: "/animations/character-loading.json",
  success: "/animations/character-success.json",
};

const GLOW_COLORS = {
  idle:    "rgba(255, 140, 0, 0.5)",
  typing:  "rgba(99, 180, 255, 0.6)",
  loading: "rgba(180, 180, 255, 0.5)",
  success: "rgba(72, 230, 150, 0.65)",
};

const STATE_LABELS = {
  idle:    { text: "I'm here to help!", emoji: "👋" },
  typing:  { text: "Looking good...",   emoji: "✍️" },
  loading: { text: "Checking...",       emoji: "⏳" },
  success: { text: "You're in!",        emoji: "🎉" },
};

const animationCache = new Map();

const CharacterAnimation = ({ state = "idle" }) => {
  const videoBoxRef  = useRef(null);
  const glowRef      = useRef(null);
  const overlayRef   = useRef(null);

  const currentState = state;
  const [animationData, setAnimationData] = useState(() => animationCache.get(ANIMATION_MAP[state]) || null);
  const animationKey = state;

  // ── Load Lottie animation ───────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const src = ANIMATION_MAP[currentState];

    if (animationCache.has(src)) {
      setAnimationData(animationCache.get(src));
      return () => { isMounted = false; };
    }

    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error("Animation unavailable");
        return response.json();
      })
      .then((data) => {
        animationCache.set(src, data);
        if (isMounted) setAnimationData(data);
      })
      .catch(() => {
        if (isMounted) setAnimationData(null);
      });

    return () => {
      isMounted = false;
    };
  }, [currentState]);

  const label = STATE_LABELS[currentState];

  return (
    // Full-width container — sits INSIDE the card at the top
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 0,
      }}
    >
      {/* Dynamic glow behind video */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "80%",
          height: "80%",
          borderRadius: "50%",
          background: GLOW_COLORS[currentState],
          filter: "blur(70px)",
          opacity: 0.5,
          transition: "background 0.7s",
          pointerEvents: "none",
          zIndex: 0,
          animation: currentState === "idle" ? "pulse 2.8s ease-in-out infinite" :
                     currentState === "loading" ? "pulse 0.9s ease-in-out infinite" : "none",
        }}
      />

      {/* ── Animation box — large and full-width ──────────────────────────────────── */}
      <div
        ref={videoBoxRef}
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: 280,
          overflow: "hidden",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          animation: currentState === "success" ? "bounce 0.6s ease-out" :
                     currentState === "typing" ? "wiggle 2s ease-in-out infinite" :
                     currentState === "idle" ? "float 3s ease-in-out infinite" : "none",
        }}
      >
        {animationData ? (
          <Lottie
            key={animationKey}
            animationData={animationData}
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Loading</span>
          </div>
        )}

        {/* Colour-tinted overlay on state */}
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            background:
              currentState === "success"
                ? "linear-gradient(180deg,transparent 40%,rgba(72,230,150,0.25) 100%)"
                : currentState === "typing"
                ? "linear-gradient(180deg,transparent 40%,rgba(99,180,255,0.18) 100%)"
                : "linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.55) 100%)",
            transition: "background 0.6s",
            pointerEvents: "none",
          }}
        />

        {/* Badge pinned to bottom of video */}
        {label && (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "6px 20px",
              background:
                currentState === "success"
                  ? "linear-gradient(90deg,#48E696,#60B4FF)"
                  : "rgba(0,0,0,0.55)",
              border: `1px solid ${
                currentState === "success" ? "#48E696" :
                currentState === "typing"  ? "rgba(99,180,255,0.5)" :
                "rgba(255,255,255,0.15)"
              }`,
              borderRadius: 999,
              color: currentState === "success" ? "#000" : "#fff",
              fontSize: 13,
              fontWeight: 700,
              backdropFilter: "blur(12px)",
              whiteSpace: "nowrap",
            }}
          >
            {label.emoji} {label.text}
          </div>
        )}
      </div>
    </div>
  );
};

// Add CSS keyframes for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-15px) scale(1.05); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.15); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes wiggle {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
    @keyframes slideUp {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

export default CharacterAnimation;