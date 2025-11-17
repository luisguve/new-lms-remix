import type { BlocksContent } from "@strapi/blocks-react-renderer";
import BlockRendererClient from "./BlockRenderer";
import { Button } from "./ui/button";
import { Link } from "react-router";

export interface HeroAreaProps extends Record<string, unknown> {
  title?: string;
  description?: BlocksContent;
}

export default function HeroArea(props: HeroAreaProps) {
  const { title, description } = props;
  return (
    <section className="py-32">
      <div className="container text-center mx-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {title && <h1 className="text-3xl font-semibold lg:text-6xl" dangerouslySetInnerHTML={{ __html: title }}></h1>}
          {description && (
            <div className="text-muted-foreground text-balance lg:text-lg">
              <BlockRendererClient content={description}></BlockRendererClient>
            </div>
          )}
        </div>
        <Button asChild size="lg" className="mt-10">
          <Link to={"/courses"}>Go to courses</Link>
        </Button>
      </div>
    </section>
  );
}
