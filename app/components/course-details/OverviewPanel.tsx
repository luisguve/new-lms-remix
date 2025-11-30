import BlockRendererClient from "../BlockRenderer";
import { StrapiImage } from "../StrapiImage";
import type { ICourse } from "~/utils/types";

type OverviewPanelProps = Pick<ICourse, "description" | "long_description" | "thumbnail">;

export default function OverviewPanel({
  description,
  thumbnail,
  long_description,
}: OverviewPanelProps) {
  return (
    <div className="prose prose-h2:text-xl sm:prose-h2:text-3xl max-w-none">
      {thumbnail && (
        <div className="mb-6">
          <StrapiImage
            url={thumbnail.url}
            alternativeText={thumbnail.alternativeText}
            className="w-full rounded-lg"
          />
        </div>
      )}
      <h2 className="mb-5">Course Description</h2>
      <BlockRendererClient content={description} />
      {long_description && (
        <BlockRendererClient content={long_description} />
      )}
    </div>
  );
}

