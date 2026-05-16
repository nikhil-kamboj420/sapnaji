import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { galleryImages } from "../data/data";

export default function GallerySection() {
  return (
    <SectionWrapper
      id="gallery"
      title="Memory Gallery"
      description="Scroll through a curated collection of cherished moments. Each card feels like a polished keepsake."
    >
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-3">
        {galleryImages.map((item, index) => (
          <motion.article
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="min-w-[220px] max-w-[220px] animated-card overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-soft"
          >
            <div className="relative h-[280px] overflow-hidden">
              <img
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#090318]/95 to-transparent" />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">
                {item.label}
              </p>
              <p className="text-sm leading-6 text-white/80">{item.caption}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </SectionWrapper>
  );
}
