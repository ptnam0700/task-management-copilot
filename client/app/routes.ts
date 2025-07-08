import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("tasks/list", "routes/tasks.list.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
] satisfies RouteConfig;
