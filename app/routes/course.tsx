import type { Route } from "./+types/course";
import type { ICourse } from "@utils/types";
import CoursePage from "~/components/CoursePage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const res = await fetch(`${process.env.STRAPI_URL}/api/maestro/courses/${params.slug}`);
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Response("Not Found", { status: 404 });
    }
    throw new Response(res.statusText, { status: res.status });
  }
  
  const data: { course: ICourse } = await res.json();

  return data;
}

export default function Courses({ loaderData }: Route.ComponentProps) {
  return <CoursePage {...loaderData.course} />;
}
