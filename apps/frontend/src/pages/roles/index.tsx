import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { HasPermission } from "@/routes/guard";
import { DataTable } from "@/components/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { PageShell } from "@/components/common/page-shell";

type UserItem = { id: string; email: string };
type RoleItem = { id: string; name: string; code: string; permissions?: { permission: { id: string; code: string } }[] };

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const loadAll = async () => {
    const [roleRes, userRes] = await Promise.all([http.get("/roles"), http.get("/users")]);
    setRoles(roleRes.data);
    setUsers(userRes.data);
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
    <PageShell title="角色管理" description="角色列表与用户角色分配">
      <HasPermission required="role.manage">
        <FilterBar>
          <select
            className="select select-bordered select-sm"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">选择用户</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
          <select
            className="select select-bordered select-sm"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            <option value="">选择角色</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={assignRole}>保存角色分配</button>
        </FilterBar>
      </HasPermission>

      <DataTable
        title="角色列表"
        rows={roles}
        columns={[
          { key: "name", header: "角色名", render: (r) => r.name },
          { key: "code", header: "角色编码", render: (r) => r.code },
          {
            key: "permissions",
            header: "绑定权限",
            render: (r) => (r.permissions || []).map((p) => p.permission.code).join(", ") || "无",
          },
        ]}
      />
    </PageShell>
  );
}
