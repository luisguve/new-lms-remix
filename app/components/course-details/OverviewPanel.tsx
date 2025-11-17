import type { BlocksContent } from "@strapi/blocks-react-renderer";
import BlockRendererClient from "../BlockRenderer";

type OverviewPanelProps = {
  description: BlocksContent;
  long_description?: BlocksContent;
};

export default function OverviewPanel({
  description,
  long_description,
}: OverviewPanelProps) {
  return (
    <div className="prose prose-h2:text-xl sm:prose-h2:text-3xl max-w-none">
      <h2 className="mb-5">Course Description</h2>
      <BlockRendererClient content={description} />
      {long_description && (
        <BlockRendererClient content={long_description} />
      )}
    </div>
  );
}

