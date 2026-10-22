import type { RouteObject } from "react-router";
import { draftRoute } from "../features/draft/routes";
import { StartPage } from "../pages/StartPage";
import { Layout } from "./Layout";

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [{ index: true, element: <StartPage /> }, draftRoute],
  },
];
