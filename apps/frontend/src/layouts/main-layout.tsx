import { Link, Outlet } from "react-router-dom";

const links = [
  ["用户管理", "/main/users"],
  ["角色管理", "/main/roles"],
  ["权限管理", "/main/permissions"],
  ["通知中心", "/main/notifications"],
  ["会员积分", "/main/memberships"],
  ["教材库", "/main/textbooks"],
  ["分类标签", "/main/categories"],
  ["工单", "/main/tickets"],
];

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-base-200 text-base-content">
      <aside className="w-56 border-r border-base-300 bg-base-100 p-4">
        <h3 className="mb-4 text-lg font-semibold">LingoPath</h3>
        <nav className="space-y-2">
          {links.map(([label, to]) => (
            <Link key={to} to={to} className="btn btn-ghost w-full justify-start">
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
