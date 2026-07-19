import Image from "next/image";
import { cn } from "@/frontend/lib/cn";

type AssetImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
};

/** Renders local assets; SVGs skip next/image optimization. */
export function AssetImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
}: AssetImageProps) {
  const isSvg = src.endsWith(".svg");

  if (isSvg) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn("absolute inset-0 size-full", className)}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  if (fill) {
    return (
      <Image src={src} alt={alt} fill className={className} sizes={sizes} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 0}
      height={height ?? 0}
      className={className}
      sizes={sizes}
    />
  );
}
