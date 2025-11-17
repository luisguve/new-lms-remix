import { type BlocksContent } from "@strapi/blocks-react-renderer";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import BlockRendererClient from "./BlockRenderer";
import { Link } from "react-router";
import type { ICourse } from "~/utils/types";
import { Course } from "./cards/Course";

export interface CoursesListingInlineProps extends Record<string, unknown> {
  title?: string;
  pretitle?: string;
  description?: BlocksContent;
  courses?: ICourse;
}

interface HighlightedCoursesResponse {
  courses: Array<ICourse>;
}

export default function CoursesListingInline(props: CoursesListingInlineProps) {
  const { pretitle, title, description } = props;

  const strapiUrl = import.meta.env.VITE_STRAPI_URL;
  const apiUrl = strapiUrl 
    ? `${strapiUrl}/api/maestro/highlighted-courses`
    : null;

  const { data, status } = useQuery<HighlightedCoursesResponse>({
    queryKey: ["highlighted-courses", strapiUrl],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("STRAPI_URL is not defined");
      }
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch highlighted courses");
      }
      return response.json();
    },
    enabled: !!apiUrl,
  });

  return (
    <section className="py-32">
      <div className="container mx-auto flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          {pretitle && (
            <Badge variant="secondary" className="mb-6">
              {pretitle}
            </Badge>
          )}
          {title && (
            <h2 className="mb-3 text-pretty text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
              {title}
            </h2>
          )}
          {description && (
            <div className="text-muted-foreground mb-8 md:text-base lg:max-w-2xl lg:text-lg">
              <BlockRendererClient content={description} />
            </div>
          )}
          <Button variant="link" className="w-full sm:w-auto" asChild>
            <Link to={"/courses"}>View all courses</Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-6 lg:gap-8 w-full">
          {status === "pending" ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Course key={index} />
            ))
          ) : (
            data?.courses.map((course) => (
              <Course key={course.slug} course={course} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
