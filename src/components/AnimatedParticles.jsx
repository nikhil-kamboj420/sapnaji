import { useEffect, useState } from "react";

const particleCount = 18;

export default function AnimatedParticles() {
  const [motionOffset, setMotionOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 20;
      const y = (event.clientY / window.innerHeight - 0.5) * 20;
      setMotionOffset({ x, y });
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(241,189,255,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,209,188,0.14),_transparent_22%)]" />
      {Array.from({ length: particleCount }).map((_, index) => {
        const size = 14 + (index % 5) * 6;
        const left = 5 + ((index * 7) % 92);
        const top = 8 + ((index * 11) % 86);
        const delay = (index * 0.2).toFixed(2);
        const hue = 280 + ((index * 10) % 80);
        return (
          <span
            key={index}
            className="absolute rounded-full opacity-80 blur-sm"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
              background: `hsla(${hue}, 78%, 74%, 0.48)`,
              transform: `translate3d(${motionOffset.x * (index % 3) * 0.12}px, ${motionOffset.y * (index % 4) * 0.14}px, 0)`,
              animation: `float 9s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
