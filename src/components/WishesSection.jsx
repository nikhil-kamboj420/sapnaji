import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { messages } from "../data/data";

export default function WishesSection() {
  return (
    <SectionWrapper
      id="wishes"
      title="Floating Wishes"
      description="A gentle forest of floating blessings, each phrase moving like a soft lantern in the sky."
    >
      <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-gradient-to-br from-[#1b0c31]/80 to-[#160a25]/80 p-8 shadow-glow backdrop-blur-2xl">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-5 top-12 h-24 w-24 rounded-full bg-pink-400/20 blur-3xl" />
          <div className="absolute right-8 top-24 h-32 w-32 rounded-full bg-purple-300/15 blur-3xl" />
        </div>
        <div className="relative grid gap-4">
          {messages.map((wish, index) => (
            <motion.div
              key={wish}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: index * 0.12 }}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-white/80 shadow-soft"
            >
              <p className="text-base leading-7">{wish}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
