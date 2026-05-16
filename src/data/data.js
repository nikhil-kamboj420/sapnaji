import placeholderImage from "../assets/placeholder-image.svg";
import jsonData from "../data.json";

const normalizeVideoSrc = (src) => {
  if (!src) return "";
  if (src.startsWith("public/")) {
    return src.replace(/^public\//, "/");
  }
  return src;
};

export const galleryImages = jsonData.images.map((item) => ({
  id: item.id,
  label: item.caption ? item.caption.toUpperCase() : `IMAGE_${item.id}`,
  src: item.src,
  caption: item.caption || "",
  alt: item.alt || item.caption || `Image ${item.id}`,
}));

export const videos = jsonData.videos.map((item) => ({
  id: item.id,
  label: item.label || `VIDEO_${item.id}`,
  src: normalizeVideoSrc(item.src),
  poster: placeholderImage,
  caption: item.caption || "",
  alt: item.alt || item.caption || `Video ${item.id}`,
}));

export const messages = [
  "May today glow as beautifully as you do.",
  "Celebrate every small wonder of this day.",
  "Your story is the sweetest gift.",
];

export const finalMessage =
  "This celebration is just the beginning—every moment ahead is yours to make magical.";
