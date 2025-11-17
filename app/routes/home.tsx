import type { Route } from "./+types/home";
import type { DynamicData } from "@utils/types";
import renderComponents from "~/lib/renderComponent";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const res = await fetch(`${process.env.STRAPI_URL}/api/homepage`);
  const { data }: DynamicData = await res.json();

  return data;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return renderComponents(loaderData.blocks);
}
