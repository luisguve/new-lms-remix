import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("layouts/default.tsx", [
    route("/courses", "routes/courses.tsx"),
    route("/courses/:slug", "routes/course.tsx"),
    route("/courses/:slug/:lecture", "routes/course.$slug.$lecture.tsx"),
    route("/success-purchase", "routes/success-purchase.tsx"),
    route("/profile", "routes/profile.tsx"),
    route("/login", "routes/login-register.tsx"),
    index("routes/home.tsx"),
  ])
] satisfies RouteConfig;
