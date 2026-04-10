import { Link, Outlet } from "react-router-dom";

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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <aside style={{ width: 220, background: "#f3f4f6", padding: 16 }}>
        <h3>LingoPath</h3>
        {links.map(([label, to]) => (
          <div key={to} style={{ marginTop: 8 }}>
            <Link to={to}>{label}</Link>
          </div>
        ))}
      </aside>
      <main style={{ flex: 1, padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
