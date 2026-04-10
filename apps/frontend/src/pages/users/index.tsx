import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/common/page-shell";
import { SearchFilterBar } from "@/components/common/search-filter-bar";

type UserItem = { id: string; email: string; name?: string; roleAssignments?: { role: { code: string } }[] };

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const loadUsers = async () => {
    const res = await http.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <PageShell title="用户管理" description="用户列表与角色归属">
      <SearchFilterBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索邮箱/昵称/角色" />
      <DataTable
        title="用户列表"
        rows={users.filter((u) => `${u.email} ${u.name || ""} ${(u.roleAssignments || []).map((r) => r.role.code).join(" ")}`.toLowerCase().includes(keyword.trim().toLowerCase()))}
        columns={[
          { key: "email", header: "邮箱", render: (u) => u.email },
          { key: "name", header: "昵称", render: (u) => u.name || "-" },
          {
            key: "roles",
            header: "角色",
            render: (u) => (u.roleAssignments || []).map((r) => r.role.code).join(", ") || "无角色",
          },
        ]}
      />
    </PageShell>
  );
}
