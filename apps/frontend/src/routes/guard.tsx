import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";
import { ReactNode } from "react";

export function RouteGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

export function PermissionGuard({
  required,
  children,
}: {
  required: string;
  children: ReactNode;
}) {
  const permissions = useAuthStore((s) => s.permissions);
  if (!permissions.includes(required)) return <Navigate to="/403" replace />;
  return <>{children}</>;
}

export function HasPermission({
  required,
  children,
}: {
  required: string;
  children: ReactNode;
}) {
  const permissions = useAuthStore((s) => s.permissions);
  if (!permissions.includes(required)) return null;
  return <>{children}</>;
}
