import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import BlockRendererClient from "../BlockRenderer";
import { formatSeconds } from "~/lib/duration";
import type { Module } from "~/utils/types";

type CurriculumPanelProps = {
  modules: Module[];
  courseSlug: string;
};

export default function CurriculumPanel({
  modules,
  courseSlug,
}: CurriculumPanelProps) {
  return (
    <div className="curriculum-sections">
      {modules.map((module) => (
        <div
          key={module.documentId}
          className="border border-border rounded-lg mt-[50px] first:mt-0"
        >
          <div className="py-5 px-4 md:py-[22px] md:px-12">
            <h5 className="text-xl mb-2">{module.title}</h5>
            {module.description && (
              <BlockRendererClient content={module.description} />
            )}
          </div>
          {module.lectures.length > 0 && (
            <ul className="section-content">
              {module.lectures.map((lecture) => (
                <li
                  key={lecture.documentId}
                  className="odd:bg-muted/50 even:bg-background border-t border-border last:rounded-b-lg"
                >
                  <Link
                    to={`/courses/${courseSlug}/${lecture.slug}`}
                    className="block w-full text-sm py-3 px-4 md:px-12 hover:bg-accent transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="grow">{lecture.title}</span>
                      <Badge variant="outline">
                        {formatSeconds(lecture.duration)}
                      </Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

