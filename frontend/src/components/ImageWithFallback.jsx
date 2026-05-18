import { useEffect, useState } from "react";
import { resolveImageSource } from "../lib/images";

export default function ImageWithFallback({ src, alt, className }) {
  const [currentSource, setCurrentSource] = useState(resolveImageSource(src));

  useEffect(() => {
    setCurrentSource(resolveImageSource(src));
  }, [src]);

  return (
    <img
      src={currentSource}
      alt={alt}
      className={className}
      onError={() => setCurrentSource("/images/Overlay.png")}
    />
  );
}

