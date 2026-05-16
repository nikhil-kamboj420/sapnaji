import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const introText = "Someone special has a surprise waiting...";

export default function LoaderIntro({ onComplete }) {
  const [typed, setTyped] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let index = 0;
    let buttonTimeout;

    const intervalId = setInterval(() => {
      if (index < introText.length) {
        setTyped((prev) => prev + introText.charAt(index));
        index++;
      } else {
        clearInterval(intervalId);

        buttonTimeout = setTimeout(() => {
          setVisible(true);
        }, 350);
      }
    }, 45);

    return () => {
      clearInterval(intervalId);

      if (buttonTimeout) {
        clearTimeout(buttonTimeout);
      }
    };
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        id: index,
        size: 4 + (index % 4) * 2,
        left: `${Math.random() * 92}%`,
        top: `${Math.random() * 82}%`,
      })),
    []
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#090318] px-5"
    >
      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <span
            key={star.id}
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.id * 0.07}s`,
            }}
            className="absolute rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.4)] animate-pulse"
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-3xl shadow-glow">
        
        <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm tracking-[0.28em] text-white/70">
          BIRTHDAY CEREMONY
        </span>

        <h1 className="text-center text-4xl font-semibold leading-tight text-white sm:text-5xl">
          A moment designed for you
        </h1>

        <p className="min-h-[80px] text-center text-base leading-7 text-white/80 sm:text-lg">
          {typed}
          <span className="ml-1 inline-block h-6 w-1 animate-pulse bg-white/90 align-middle" />
        </p>

        <motion.button
          disabled={!visible}
          onClick={onComplete}
          whileHover={{ scale: visible ? 1.03 : 1 }}
          whileTap={{ scale: visible ? 0.96 : 1 }}
          className="mt-3 rounded-full bg-gradient-to-r from-[#d26fff] to-[#ff9cab] px-9 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tap to Begin
        </motion.button>

      </div>
    </motion.section>
  );
}