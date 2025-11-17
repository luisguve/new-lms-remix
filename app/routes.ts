import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("layouts/default.tsx", [
    route("/courses", "routes/courses.tsx"),
    route("/courses/:slug", "routes/course.tsx"),
    index("routes/home.tsx"),
  ])
] satisfies RouteConfig;
