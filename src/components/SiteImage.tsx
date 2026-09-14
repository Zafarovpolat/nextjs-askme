import Image from "next/image";
import type { CSSProperties } from "react";

type SiteImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
  draggable?: boolean;
  /** Без lazy; без priority — Next не добавит preload в head. */
  eager?: boolean;
  sizes?: string;
};

/**
 * Картинки сайта: next/image + размеры. По умолчанию loading=lazy.
 * blob:/data: — обычный img (превью в форме).
 */
export default function SiteImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  title,
  draggable,
  eager = false,
  sizes,
}: SiteImageProps) {
  const loading = eager ? "eager" : "lazy";

  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        title={title}
        draggable={draggable}
        loading={loading}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      title={title}
      draggable={draggable}
      sizes={sizes}
      unoptimized
      loading={loading}
      decoding="async"
    />
  );
}
