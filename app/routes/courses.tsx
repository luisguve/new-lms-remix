import type { Route } from "./+types/courses";
import type { ICourse } from "@utils/types";
import CoursesListing from "~/components/CoursesListing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const res = await fetch(`${process.env.STRAPI_URL}/api/maestro/courses`);
  const data: { courses: ICourse[] } = await res.json();

  return data;
}

export default function Courses({ loaderData }: Route.ComponentProps) {
  return <CoursesListing courses={loaderData.courses} />;
}
