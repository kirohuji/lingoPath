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
    <div className="flex min-h-screen bg-base-200/60 text-base-content">
      <aside className="w-64 border-r border-base-300/80 bg-base-100/90 p-4 backdrop-blur">
        <div className="mb-4 rounded-xl bg-gradient-to-r from-primary/15 to-secondary/15 p-3">
          <h3 className="text-lg font-semibold">LingoPath Admin</h3>
          <p className="mt-1 text-xs opacity-70">内容管理控制台</p>
        </div>
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
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
