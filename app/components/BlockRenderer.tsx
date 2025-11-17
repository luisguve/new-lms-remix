import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import type { ReactNode } from "react";
import { StrapiImage } from "./StrapiImage";

// Move nested components outside of BlockRendererClient
const ListBlock = ({
  format,
  children,
}: {
  format: string;
  children?: ReactNode;
}) => {
  if (format === "ordered") {
    return <ol className="tw-list-inside tw-list-decimal">{children}</ol>;
  }
  return <ul className="tw-list-inside tw-list-disc">{children}</ul>;
};

const ImageBlock = ({
  image,
}: {
  image: {
    url: string;
    width: number;
    height: number;
    alternativeText?: string | null;
  };
}) => {
  return (
    <StrapiImage
      url={image.url}
      width={image.width}
      height={image.height}
      alternativeText={image.alternativeText || ""}
    />
  );
};

const BlockRendererClient = ({
  content,
}: {
  readonly content: BlocksContent;
}) => {
  if (!content) return null;
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        list: ListBlock,
        image: ImageBlock,
      }}
    />
  );
};

export default BlockRendererClient;
