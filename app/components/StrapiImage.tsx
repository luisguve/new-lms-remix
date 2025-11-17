import { Image } from "@unpic/react";
import type { Image as ImageType } from "~/utils/types";

interface StrapiImageProps extends ImageType {
  height?: number;
  width?: number;
  className?: string;
}

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_URL ?? "http://localhost:1337";

export function getStrapiMedia(url: string | null) {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${STRAPI_API_URL}${url}`;
}

export const StrapiImage = ({
  url,
  alternativeText,
  className,
  width,
  height,
  ...rest
}: Readonly<StrapiImageProps & Record<string, unknown>>) => {
  const imageUrl = getStrapiMedia(url);
  if (!imageUrl) return null;

  const { documentId, fill, ...validProps } = rest as Record<string, unknown>;

  if (!width || !height) {
    return (
      <img
        alt={alternativeText || ""}
        className={className}
        {...validProps}
        src={imageUrl}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      width={width}
      height={height}
      alt={alternativeText || ""}
      {...validProps}
    />
  );
};
