import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/common/page-shell";
import { SearchFilterBar } from "@/components/common/search-filter-bar";
import { FormDialog } from "@/components/form-dialog";
import { AvatarUpload } from "@/components/common/avatar-upload";
import { useAuthStore } from "@/stores/auth-store";

type UserItem = { id: string; email: string; name?: string; avatarUrl?: string; roleAssignments?: { role: { code: string } }[] };
type RoleItem = { id: string; name: string; code: string };

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [form, setForm] = useState({ email: "", name: "", roleCodes: [] as string[], avatarUrl: "" });
  const authUser = useAuthStore((s) => s.user);
  const setAuthUser = useAuthStore((s) => s.setUser);

  const loadUsers = async () => {
    const res = await http.get("/users");
    setUsers(res.data);
  };
  const loadRoles = async () => {
    const res = await http.get("/roles");
    setRoles(res.data);
  };

  useEffect(() => {
    void Promise.all([loadUsers(), loadRoles()]);
  }, []);

  return (
    <PageShell title="用户管理" description="用户列表与角色归属（前端交互版 CRUD）">
      <SearchFilterBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索邮箱/昵称/角色">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setForm({ email: "", name: "", roleCodes: [], avatarUrl: "" });
            setCreateOpen(true);
          }}
        >
          新增用户
        </button>
      </SearchFilterBar>
      <DataTable
        title="用户列表"
        rows={users.filter((u) => `${u.email} ${u.name || ""} ${(u.roleAssignments || []).map((r) => r.role.code).join(" ")}`.toLowerCase().includes(keyword.trim().toLowerCase()))}
        columns={[
          {
            key: "avatar",
            header: "头像",
            render: (u) => (
              u.avatarUrl ? (
                <div className="avatar">
                  <div className="size-9 rounded-full">
                    <img src={u.avatarUrl} alt={u.name || u.email} />
                  </div>
                </div>
              ) : (
                <div className="avatar placeholder">
                  <div className="size-9 rounded-full bg-base-300 text-base-content">
                    <span className="text-xs">{(u.name || u.email).slice(0, 1).toUpperCase()}</span>
                  </div>
                </div>
              )
            ),
          },
          { key: "email", header: "邮箱", render: (u) => u.email },
          { key: "name", header: "昵称", render: (u) => u.name || "-" },
          {
            key: "roles",
            header: "角色",
            render: (u) => (u.roleAssignments || []).map((r) => r.role.code).join(", ") || "无角色",
          },
          {
            key: "actions",
            header: "操作",
            render: (u) => (
              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => {
                    setEditTarget(u);
                    setForm({
                      email: u.email,
                      name: u.name || "",
                      roleCodes: (u.roleAssignments || []).map((r) => r.role.code),
                      avatarUrl: u.avatarUrl || "",
                    });
                  }}
                >
                  编辑
                </button>
                <button className="btn btn-error btn-outline btn-xs" onClick={() => setDeleteTarget(u)}>
                  删除
                </button>
              </div>
            ),
          },
        ]}
      />
      <FormDialog
        title="新增用户"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        confirmDisabled={!form.email.trim()}
        onConfirm={async () => {
          await http.post("/users", {
            email: form.email.trim(),
            name: form.name.trim() || undefined,
            avatarUrl: form.avatarUrl || undefined,
            roleCodes: form.roleCodes,
          });
          await loadUsers();
          setCreateOpen(false);
        }}
      >
        <div className="space-y-3">
          <AvatarUpload value={form.avatarUrl} onChange={(next) => setForm((p) => ({ ...p, avatarUrl: next }))} />
          <input className="input input-bordered w-full" placeholder="邮箱" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <input className="input input-bordered w-full" placeholder="昵称" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <div className="space-y-2">
            <div className="text-sm font-medium">分配角色</div>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const checked = form.roleCodes.includes(role.code);
                return (
                  <label key={role.id} className={`btn btn-sm ${checked ? "btn-primary" : "btn-outline"}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={() =>
                        setForm((p) => ({
                          ...p,
                          roleCodes: checked ? p.roleCodes.filter((c) => c !== role.code) : [...p.roleCodes, role.code],
                        }))
                      }
                    />
                    {role.name} ({role.code})
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </FormDialog>
      <FormDialog
        title="编辑用户"
        open={Boolean(editTarget)}
        onCancel={() => setEditTarget(null)}
        confirmDisabled={!form.email.trim() || !editTarget}
        onConfirm={async () => {
          if (!editTarget) return;
          await http.patch(`/users/${editTarget.id}`, {
            email: form.email.trim(),
            name: form.name.trim() || undefined,
            avatarUrl: form.avatarUrl || undefined,
            roleCodes: form.roleCodes,
          });
          await loadUsers();
          if ((authUser?.id && authUser.id === editTarget.id) || (authUser?.email && authUser.email === editTarget.email)) {
            setAuthUser({
              ...authUser,
              email: form.email.trim(),
              name: form.name.trim() || undefined,
              avatarUrl: form.avatarUrl || undefined,
            });
          }
          setEditTarget(null);
        }}
      >
        <div className="space-y-3">
          <AvatarUpload value={form.avatarUrl} onChange={(next) => setForm((p) => ({ ...p, avatarUrl: next }))} />
          <input className="input input-bordered w-full" placeholder="邮箱" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <input className="input input-bordered w-full" placeholder="昵称" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <div className="space-y-2">
            <div className="text-sm font-medium">分配角色</div>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const checked = form.roleCodes.includes(role.code);
                return (
                  <label key={role.id} className={`btn btn-sm ${checked ? "btn-primary" : "btn-outline"}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={() =>
                        setForm((p) => ({
                          ...p,
                          roleCodes: checked ? p.roleCodes.filter((c) => c !== role.code) : [...p.roleCodes, role.code],
                        }))
                      }
                    />
                    {role.name} ({role.code})
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </FormDialog>
      <FormDialog
        title="删除用户"
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        confirmText="确认删除"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await http.delete(`/users/${deleteTarget.id}`);
          await loadUsers();
          if (authUser?.id && authUser.id === deleteTarget.id) {
            setAuthUser(null);
          }
          setDeleteTarget(null);
        }}
      >
        <p className="text-sm opacity-80">
          {deleteTarget ? `确认删除用户「${deleteTarget.email}」吗？` : ""}
        </p>
      </FormDialog>
    </PageShell>
  );
}
