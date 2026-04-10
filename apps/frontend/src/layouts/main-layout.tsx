import { NavLink, Outlet } from "react-router-dom";

const userSubLinks = [
  ["用户管理", "/main/users"],
  ["角色管理", "/main/roles"],
  ["权限管理", "/main/permissions"],
] as const;

const topLinks = [
  ["通知中心", "/main/notifications"],
  ["会员积分", "/main/memberships"],
  ["教材库", "/main/textbooks"],
  ["分类标签", "/main/categories"],
  ["工单", "/main/tickets"],
] as const;

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-base-200 text-base-content">
      <aside className="w-56 border-r border-base-300 bg-base-100 p-4">
        <h3 className="mb-4 text-lg font-semibold">LingoPath</h3>
        <nav className="space-y-3">
          <div>
            <div className="px-3 text-xs font-semibold opacity-60">用户权限</div>
            <div className="mt-1 space-y-1">
              {userSubLinks.map(([label, to]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `btn btn-sm w-full justify-start pl-6 ${isActive ? "btn-primary" : "btn-ghost"}`}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            {topLinks.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `btn w-full justify-start ${isActive ? "btn-primary" : "btn-ghost"}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
