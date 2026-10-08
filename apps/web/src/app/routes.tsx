import type { RouteObject } from "react-router";
import { StartPage } from "../pages/StartPage";
import { Layout } from "./Layout";

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [{ index: true, element: <StartPage /> }],
  },
];
