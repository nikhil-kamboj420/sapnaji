import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { videos } from "../data/data";
import useOnScreen from "../hooks/useOnScreen";

export default function VideoSection({ onEnterSection, onLeaveSection }) {
  const sectionRef = useRef(null);
  const isSectionVisible = useOnScreen(sectionRef, "-25%");
  const sectionEntered = useRef(false);

  useEffect(() => {
    if (isSectionVisible && !sectionEntered.current) {
      sectionEntered.current = true;
      onEnterSection?.();
    } else if (!isSectionVisible && sectionEntered.current) {
      sectionEntered.current = false;
      onLeaveSection?.();
    }
  }, [isSectionVisible, onEnterSection, onLeaveSection]);

  return (
    <div ref={sectionRef}>
      <SectionWrapper
        id="videos"
        title="Video Memories"
        description="A vertical set of video cards built for mobile viewing. Tap each card to discover a hidden cinematic memory."
      >
        <div className="flex flex-col gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}

function VideoCard({ video }) {
  const videoRef = useRef(null);
  const isVisible = useOnScreen(videoRef, "-120px");
  const isVideo = Boolean(video.src);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    if (isVisible) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isVisible, isVideo]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mx-auto w-full max-w-[440px] rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-3xl"
    >
      <div className="relative overflow-hidden rounded-[32px] bg-[#130829] shadow-[inset_0_0_60px_rgba(0,0,0,0.18)]">
        {isVideo ? (
          <video
            ref={videoRef}
            src={video.src}
            poster={video.poster}
            autoPlay
            playsInline
            loop
            className="aspect-[9/16] w-full object-cover"
          />
        ) : (
          <img
            src={video.poster}
            alt={video.alt}
            className="aspect-[9/16] w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-4 bottom-4 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
          {video.label}
        </div>
      </div>
      <div className="mt-4 space-y-2 px-1">
        <p className="text-sm text-white/70">{video.caption}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          Vertical reel layout • autoplay when visible • pause when out of view
        </p>
      </div>
    </motion.div>
  );
}
