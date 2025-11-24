import type { Route } from "./+types/course.$slug.$lecture";
import type { ICourse, ILecture } from "@utils/types";
import { redirect } from "react-router";
import LectureDetails from "~/components/LectureDetails";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData?.lecture?.title || "Lecture" },
    { name: "description", content: "Course Lecture" },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  // Fetch course by slug
  const strapiUrl = process.env.STRAPI_URL;
  if (!strapiUrl) {
    throw new Response("Server configuration error", { status: 500 });
  }

  const courseRes = await fetch(`${strapiUrl}/api/maestro/courses/${params.slug}`);
  
  if (!courseRes.ok) {
    if (courseRes.status === 404) {
      throw new Response("Course not found", { status: 404 });
    }
    throw new Response(courseRes.statusText, { status: courseRes.status });
  }
  
  const courseData: { course: ICourse } = await courseRes.json();
  const course = courseData.course;

  // Flatten all lectures from all modules
  const lectures = course.modules.reduce(
    (lecturesList, module) => lecturesList.concat(module.lectures),
    [] as ILecture[]
  );

  // Find the lecture by slug
  const lectureIndex = lectures.findIndex(
    (lecture) => lecture.slug === params.lecture
  );

  if (lectureIndex === -1) {
    throw new Response("Lecture not found", { status: 404 });
  }

  const lecture = lectures[lectureIndex];
  const prevLecture = lectures[lectureIndex - 1] || null;
  const nextLecture = lectures[lectureIndex + 1] || null;

  // Check user access - we'll do this in the component since we need client-side auth state
  // But we can return the data needed for access check
  return {
    lecture,
    prevNextLesson: {
      prev: prevLecture,
      next: nextLecture,
    },
    courseSlug: params.slug,
    courseId: course.documentId,
    coursePath: `/courses/${params.slug}`,
    course,
  };
}

export default function Lecture({ loaderData }: Route.ComponentProps) {
  return <LectureDetails data={loaderData} />;
}

