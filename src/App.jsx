import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { AnimatePresence, motion } from "framer-motion";

import AnimatedParticles from "./components/AnimatedParticles";
import LoaderIntro from "./components/LoaderIntro";
import HeroReveal from "./components/HeroReveal";
import GallerySection from "./components/GallerySection";
import VideoSection from "./components/VideoSection";
import CakeCeremony from "./components/CakeCeremony";
import WishesSection from "./components/WishesSection";
import EndingSection from "./components/EndingSection";
import { finalMessage } from "./data/data";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const audioRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time) {
      lenis.raf(time);
      rafId.current = requestAnimationFrame(raf);
    }
    rafId.current = requestAnimationFrame(raf);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      lenis.destroy();
    };
  }, []);

  const handleReady = () => {
    setIsReady(true);
    audioRef.current?.play().catch((error) => {
      console.warn("Audio playback failed:", error);
    });
  };

  const handleEnterVideoSection = () => {
    audioRef.current?.pause();
  };

  const handleLeaveVideoSection = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#090318] text-white">
      {/* Replace /birthday-music.mp3 with your actual birthday song file in the public/ folder */}
      <audio
        ref={audioRef}
        src="/birthday-music.mp3"
        preload="auto"
        loop
        className="hidden"
      />
      <AnimatedParticles />
      <AnimatePresence mode="wait">
        {!isReady && <LoaderIntro key="loader" onComplete={handleReady} />}
      </AnimatePresence>

      {isReady && (
        <main className="relative z-10 overflow-hidden">
          <HeroReveal />
          <GallerySection />
          <VideoSection
            onEnterSection={handleEnterVideoSection}
            onLeaveSection={handleLeaveVideoSection}
          />
          <CakeCeremony
            onEnterSection={() => audioRef.current?.pause()}
            onCandlesComplete={() => {
              if (!audioRef.current) return;
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }}
          />
          <WishesSection />
          <EndingSection finalMessage={finalMessage} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="sticky bottom-6 left-1/2 z-20 mx-auto mt-6 flex w-full max-w-[780px] -translate-x-1/2 items-center justify-center"
          ></motion.div>
        </main>
      )}
    </div>
  );
}
