import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

export default function EndingSection({ finalMessage }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <SectionWrapper
      id="ending"
      title="One last thing..."
      description="A cinematic closing moment with a gentle reveal of the final message."
    >
      <div className="relative flex flex-col items-center gap-6 rounded-[38px] border border-white/10 bg-[#0a0517]/80 p-8 shadow-glow backdrop-blur-3xl">
        <motion.button
          onClick={() => setRevealed(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-full bg-gradient-to-r from-[#ffafb9] to-[#b886ff] px-8 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-soft"
        >
          Tap Here
        </motion.button>
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full rounded-[32px] border border-white/10 bg-white/5 p-6 text-center text-white/80 shadow-soft"
            >
              <p className="text-lg leading-8 text-white">{finalMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}
