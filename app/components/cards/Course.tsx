import { type BlocksContent } from "@strapi/blocks-react-renderer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import BlockRendererClient from "../BlockRenderer";
import { Link } from "react-router";
import type { ICourse } from "~/utils/types";
import { StrapiImage } from "../StrapiImage";
import { useUser } from "~/contexts/user-context";

interface CourseProps {
  course?: ICourse;
}

export function Course({ course }: CourseProps) {
  const { courses } = useUser();
  
  // Check if user has access to this course
  const courseStudent = course 
    ? courses.find((cs) => cs.course.slug === course.slug || cs.course.documentId === course.documentId)
    : null;
  const hasAccess = !!courseStudent;
  const currentLecture = courseStudent?.current_lecture;
  if (!course) {
    // Loading state
    return (
      <Card className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden pt-0">
        <div className="aspect-16/9 w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </CardFooter>
      </Card>
    );
  }

  // Actual course card
  return (
    <Card className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden pt-0">
      <div className="aspect-16/9 w-full">
        <a
          href={`/courses/${course.slug}`}
          className="fade-in transition-opacity duration-200 hover:opacity-70"
        >
          <StrapiImage {...course.thumbnail}></StrapiImage>
        </a>
      </div>
      <CardHeader>
        <h3 className="text-lg font-semibold hover:underline md:text-xl">
          <Link to={`/courses/${course.slug}`}>
            {course.title}
          </Link>
        </h3>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">
          <BlockRendererClient content={course.description} />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        {hasAccess && currentLecture ? (
          <Link
            to={`/courses/${course.slug}/${currentLecture.slug}`}
            className="text-foreground flex items-center hover:underline"
          >
            Continue course
          </Link>
        ) : hasAccess ? (
          <Link
            to={`/courses/${course.slug}`}
            className="text-foreground flex items-center hover:underline"
          >
            Start course
          </Link>
        ) : (
          <Link
            to={`/courses/${course.slug}`}
            className="text-foreground flex items-center hover:underline"
          >
            View course
          </Link>
        )}
        {!hasAccess && (
          <span className="text-lg font-semibold">
            ${course.price.toFixed(2)}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

