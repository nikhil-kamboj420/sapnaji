import { motion } from "framer-motion";

export default function SectionWrapper({
  id,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <section
      id={id}
      className={`relative mx-auto flex w-full max-w-[780px] flex-col gap-6 px-5 py-16 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="relative z-10 flex flex-col gap-3">
        {title && (
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
        )}
        {description && (
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            {description}
          </p>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </section>
  );
}
