import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { HasPermission } from "@/routes/guard";
import { DataTable } from "@/components/data-table";
import { SearchFilterBar } from "@/components/common/search-filter-bar";
import { PageShell } from "@/components/common/page-shell";
import { FormDialog } from "@/components/form-dialog";

type UserItem = { id: string; email: string };
type RoleItem = { id: string; name: string; code: string; permissions?: { permission: { id: string; code: string } }[] };

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
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
      <SearchFilterBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索角色名/编码/权限">
        <HasPermission required="role.manage">
          <button className="btn btn-primary btn-sm" onClick={() => setAssignOpen(true)}>分配角色</button>
        </HasPermission>
      </SearchFilterBar>

      <DataTable
        title="角色列表"
        rows={roles.filter((r) => `${r.name} ${r.code} ${(r.permissions || []).map((p) => p.permission.code).join(" ")}`.toLowerCase().includes(keyword.trim().toLowerCase()))}
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
      <FormDialog
        title="分配用户角色"
        open={assignOpen}
        onCancel={() => setAssignOpen(false)}
        confirmDisabled={!selectedUserId || !selectedRoleId}
        onConfirm={async () => {
          await assignRole();
          setAssignOpen(false);
        }}
      >
        <div className="space-y-3">
          <select
            className="select select-bordered w-full"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">选择用户</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
          <select
            className="select select-bordered w-full"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            <option value="">选择角色</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)}
          </select>
        </div>
      </FormDialog>
    </PageShell>
  );
}
