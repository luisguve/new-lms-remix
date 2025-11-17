import { Badge } from "~/components/ui/badge";
import type { ICourse } from "~/utils/types";
import { Course } from "./cards/Course";

export interface CoursesListingProps {
  courses: ICourse[];
}

export default function CoursesListing(props: CoursesListingProps) {
  const { courses } = props;

  return (
    <section className="py-32">
      <div className="container mx-auto flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6">
            Latest Courses
          </Badge>
          <h2 className="mb-3 text-pretty text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
            Discover our latest courses
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-6 lg:gap-8 w-full">
          {courses.map((course) => (
            <Course key={course.slug} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
