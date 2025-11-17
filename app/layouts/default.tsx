import { Outlet } from "react-router";
import Header from "@components/Header";
import type { Route } from "./+types/default";
import type { Layout } from "~/utils/types";
import Footer from "~/components/Footer";

export async function loader() {
  interface JSONResponse {
    data: Layout;
  }
  const res = await fetch(`${process.env.STRAPI_URL}/api/layout`);
  const { data }: JSONResponse = await res.json();

  return { data };
}

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { data } = loaderData;

  return (
    <>
      <Header {...data.header} />
      <main>
        <Outlet />
      </main>
      <Footer {...data.footer} />
    </>
  );
}
