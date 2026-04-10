import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { MainLayout } from "../layouts/main-layout";
import { RouteGuard } from "./guard";

const LoginPage = lazy(() => import("../pages/login"));
const UsersPage = lazy(() => import("../pages/users"));
const NotificationsPage = lazy(() => import("../pages/notifications"));
const MembershipPage = lazy(() => import("../pages/membership"));
const TextbooksPage = lazy(() => import("../pages/textbooks"));
const CategoriesPage = lazy(() => import("../pages/categories"));
const TicketsPage = lazy(() => import("../pages/tickets"));
const ForbiddenPage = lazy(() => import("../pages/forbidden"));

export function RouterProvider() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterContent />
    </Suspense>
  );
}

function RouterContent() {
  return useRoutes([
    { path: "/", element: <Navigate to="/main/users" replace /> },
    { path: "/auth/login", element: <LoginPage /> },
    { path: "/403", element: <ForbiddenPage /> },
    {
      path: "/main",
      element: (
        <RouteGuard>
          <MainLayout />
        </RouteGuard>
      ),
      children: [
        { path: "users", element: <UsersPage /> },
        { path: "notifications", element: <NotificationsPage /> },
        { path: "memberships", element: <MembershipPage /> },
        { path: "textbooks", element: <TextbooksPage /> },
        { path: "categories", element: <CategoriesPage /> },
        { path: "tickets", element: <TicketsPage /> },
      ],
    },
  ]);
}
