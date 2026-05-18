const REMOTE_IMAGE_PATTERN = /^(https?:)?\/\//i;
const SPECIAL_IMAGE_PATTERN = /^(data:|blob:)/i;

export function resolveImageSource(image) {
  if (!image) {
    return "/images/Overlay.png";
  }

  const normalized = image.trim();
  if (!normalized) {
    return "/images/Overlay.png";
  }

  if (
    REMOTE_IMAGE_PATTERN.test(normalized) ||
    SPECIAL_IMAGE_PATTERN.test(normalized) ||
    normalized.startsWith("/")
  ) {
    return normalized;
  }

  return `/${normalized}`;
}

