import { useEffect, useState } from "react";
import { DataTable } from "../components/data-table";
import { http } from "../modules/http";
import { HasPermission } from "../routes/guard";

type UserItem = {
  id: string;
  email: string;
  name?: string;
  roleAssignments?: { role: { name: string; code: string } }[];
};

type RoleItem = {
  id: string;
  name: string;
  code: string;
  permissions?: { permission: { id: string; code: string } }[];
};

type PermissionItem = { id: string; code: string; name?: string; type?: string };

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedBindRoleId, setSelectedBindRoleId] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  const loadAll = async () => {
    const [u, r, p] = await Promise.all([
      http.get("/users"),
      http.get("/roles"),
      http.get("/permissions"),
    ]);
    setUsers(u.data);
    setRoles(r.data);
    setPermissions(p.data);
    if (!selectedBindRoleId && r.data?.[0]?.id) {
      setSelectedBindRoleId(r.data[0].id);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    const role = roles.find((r) => r.id === selectedBindRoleId);
    setSelectedPermissionIds(
      role?.permissions?.map((item) => item.permission.id) || [],
    );
  }, [selectedBindRoleId, roles]);

  const assignRole = async () => {
    if (!selectedUserId || !selectedRoleId) return;
    await http.patch("/users/role", { userId: selectedUserId, roleId: selectedRoleId });
    await loadAll();
  };

  const bindPermissions = async () => {
    if (!selectedBindRoleId) return;
    await http.patch("/roles/permissions", {
      roleId: selectedBindRoleId,
      permissionIds: selectedPermissionIds,
    });
    await loadAll();
  };

  return (
    <section>
      <h2>用户与权限</h2>
      <DataTable title="用户列表">
        {users.map((u) => (
          <div key={u.id}>
            {u.email} / {u.name || "-"} /{" "}
            {(u.roleAssignments || []).map((r) => r.role.code).join(", ") || "无角色"}
          </div>
        ))}
      </DataTable>
      <HasPermission required="role.manage">
        <DataTable title="分配用户角色">
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
            <option value="">选择用户</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
          <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
            <option value="">选择角色</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
          <button onClick={assignRole}>保存角色分配</button>
        </DataTable>
      </HasPermission>
      <DataTable title="角色列表">
        {roles.map((r) => (
          <div key={r.id}>
            {r.name} ({r.code}) / 权限:{" "}
            {(r.permissions || []).map((item) => item.permission.code).join(", ") || "无"}
          </div>
        ))}
      </DataTable>
      <HasPermission required="permission.manage">
        <DataTable title="角色绑定权限">
          <select
            value={selectedBindRoleId}
            onChange={(e) => setSelectedBindRoleId(e.target.value)}
          >
            <option value="">选择角色</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
          <div>
            {permissions.map((p) => {
              const checked = selectedPermissionIds.includes(p.id);
              return (
                <label key={p.id} style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissionIds((prev) => [...prev, p.id]);
                      } else {
                        setSelectedPermissionIds((prev) => prev.filter((id) => id !== p.id));
                      }
                    }}
                  />
                  {p.code}
                </label>
              );
            })}
          </div>
          <button onClick={bindPermissions}>保存权限绑定</button>
        </DataTable>
      </HasPermission>
      <DataTable title="权限列表">
        {permissions.map((p) => (
          <div key={p.id}>{p.code}</div>
        ))}
      </DataTable>
    </section>
  );
}
