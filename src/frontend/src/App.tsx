import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import AdminPage from "./pages/AdminPage";
import BookmarksPage from "./pages/BookmarksPage";
import CategoryPage from "./pages/CategoryPage";
import HomePage from "./pages/HomePage";
import NoteViewerPage from "./pages/NoteViewerPage";
import ProgressPage from "./pages/ProgressPage";
import SearchPage from "./pages/SearchPage";

const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const categoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/category/$category",
  component: CategoryPage,
});

const noteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/note/$id",
  component: NoteViewerPage,
});

const bookmarksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookmarks",
  component: BookmarksPage,
});

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress",
  component: ProgressPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? "",
  }),
  component: SearchPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  categoryRoute,
  noteRoute,
  bookmarksRoute,
  progressRoute,
  adminRoute,
  searchRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}
