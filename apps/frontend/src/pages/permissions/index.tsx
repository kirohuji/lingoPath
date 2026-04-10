import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/common/page-shell";
import { SearchFilterBar } from "@/components/common/search-filter-bar";

type PermissionItem = { id: string; code: string };

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [keyword, setKeyword] = useState("");

  const loadPermissions = async () => {
    const res = await http.get("/permissions");
    setPermissions(res.data);
  };

  useEffect(() => {
    void loadPermissions();
  }, []);

  return (
    <PageShell title="权限管理" description="系统权限码列表">
      <SearchFilterBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索权限 ID/权限码" />
      <DataTable
        title="权限列表"
        rows={permissions.filter((p) => `${p.id} ${p.code}`.toLowerCase().includes(keyword.trim().toLowerCase()))}
        columns={[
          { key: "id", header: "ID", render: (p) => p.id },
          { key: "code", header: "权限码", render: (p) => p.code },
        ]}
      />
    </PageShell>
  );
}
