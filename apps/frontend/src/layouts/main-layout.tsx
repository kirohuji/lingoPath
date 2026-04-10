import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { http } from "@/modules/http";
import { useAuthStore } from "@/stores/auth-store";

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
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setPermissions = useAuthStore((s) => s.setPermissions);

  useEffect(() => {
    if (!token || user) return;
    void http.get("/auth/me").then((res) => {
      const me = res.data.user || { id: res.data.id, email: res.data.email, name: res.data.name, avatarUrl: res.data.avatarUrl };
      setUser(me);
    }).catch(() => undefined);
  }, [setUser, token, user]);

  const displayName = user?.name || user?.email || "当前用户";
  const displayEmail = user?.email || "未获取邮箱";
  const avatarText = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-screen bg-base-200/60 text-base-content">
      <aside className="flex w-64 flex-col border-r border-base-300/80 bg-base-100/90 p-4 backdrop-blur">
        <div className="mb-4 rounded-xl bg-gradient-to-r from-primary/15 to-secondary/15 p-3">
          <h3 className="text-lg font-semibold">LingoPath Admin</h3>
          <p className="mt-1 text-xs opacity-70">内容管理控制台</p>
        </div>
        <nav className="flex-1 space-y-3">
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
        <div className="mt-4 rounded-2xl border border-base-300 bg-base-100/90 p-3 shadow-sm">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <div className="avatar">
                <div className="size-10 rounded-full">
                  <img src={user.avatarUrl} alt={displayName} />
                </div>
              </div>
            ) : (
              <div className="avatar placeholder">
                <div className="size-10 rounded-full bg-primary/15 text-primary">
                  <span className="text-sm font-semibold">{avatarText}</span>
                </div>
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{displayName}</div>
              <div className="truncate text-xs opacity-70">{displayEmail}</div>
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm mt-3 w-full"
            onClick={() => {
              setToken(null);
              setPermissions([]);
              setUser(null);
              navigate("/auth/login", { replace: true });
            }}
          >
            退出登录
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
