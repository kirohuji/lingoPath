import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { HasPermission } from "@/routes/guard";
import { DataTable } from "@/components/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";

type UserItem = { id: string; email: string; name?: string; roleAssignments?: { role: { code: string } }[] };
type RoleItem = { id: string; name: string; code: string; permissions?: { permission: { id: string; code: string } }[] };
type PermissionItem = { id: string; code: string };

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const loadAll = async () => {
    const [u, r, p] = await Promise.all([http.get("/users"), http.get("/roles"), http.get("/permissions")]);
    setUsers(u.data);
    setRoles(r.data);
    setPermissions(p.data);
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const assignRole = async () => {
    if (!selectedUserId || !selectedRoleId) return;
    await http.patch("/users/role", { userId: selectedUserId, roleId: selectedRoleId });
    await loadAll();
  };

  return (
    <PageShell title="用户与权限" description="用户、角色、权限管理">
      <HasPermission required="role.manage">
        <FilterBar>
          <select
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">选择用户</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
          <select
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            <option value="">选择角色</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}({r.code})</option>)}
          </select>
          <Button size="sm" onClick={assignRole}>保存角色分配</Button>
        </FilterBar>
      </HasPermission>
      <DataTable title="用户列表">
        {users.map((u) => (
          <div key={u.id} className="text-sm">
            {u.email} / {(u.roleAssignments || []).map((r) => r.role.code).join(",") || "无角色"}
          </div>
        ))}
      </DataTable>
      <DataTable title="角色列表">
        {roles.map((r) => <div key={r.id}>{r.name} ({r.code})</div>)}
      </DataTable>
      <DataTable title="权限列表">
        {permissions.map((p) => <div key={p.id}>{p.code}</div>)}
      </DataTable>
    </PageShell>
  );
}
