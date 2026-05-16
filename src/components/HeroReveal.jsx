import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function HeroReveal() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const listener = (event) => {
      setPointer({
        x: (event.clientX / window.innerWidth - 0.5) * 10,
        y: (event.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener("pointermove", listener);
    return () => window.removeEventListener("pointermove", listener);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,199,255,0.18),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(176,130,255,0.16),_transparent_30%)]" />
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -left-8 top-24 h-24 w-24 rounded-full bg-pink-300/20 blur-3xl"
          style={{
            transform: `translate(${pointer.x}px, ${pointer.y * 0.6}px)`,
          }}
        />
        <div
          className="absolute right-8 top-1/4 h-32 w-32 rounded-full bg-purple-400/20 blur-3xl"
          style={{
            transform: `translate(${pointer.x * -0.8}px, ${pointer.y * -0.5}px)`,
          }}
        />
      </div>
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur-3xl shadow-glow"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-white/60">
            A dreamy birthday reveal
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
            Happy Birthday <span className="text-[#ffb3ce]">Dear ❣️ SAPNA</span> ❤️
          </h1>
          <p className="mt-5 text-base leading-7 text-white/75 sm:text-lg">
            A little surprise made specially for you.
          </p>
        </motion.div>
        <div className="grid w-full grid-cols-3 gap-4 sm:w-3/4">
          {["💖", "✨", "🌸"].map((emoji, index) => (
            <motion.div
              key={emoji}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12, duration: 0.8 }}
              className="flex h-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-soft text-2xl"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
