import { Link, Outlet } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";

const links = [
  ["用户权限", "/main/users"],
  ["通知中心", "/main/notifications"],
  ["会员积分", "/main/memberships"],
  ["教材库", "/main/textbooks"],
  ["分类标签", "/main/categories"],
  ["工单", "/main/tickets"],
];

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-56 border-r border-border bg-muted/40 p-4">
        <h3 className="mb-4 text-lg font-semibold">LingoPath</h3>
        <nav className="space-y-2">
          {links.map(([label, to]) => (
            <Link key={to} to={to} className={buttonVariants({ variant: "ghost", className: "w-full justify-start" })}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
