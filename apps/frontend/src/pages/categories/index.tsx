import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { PageShell } from "@/components/common/page-shell";
import { FilterBar } from "@/components/common/filter-bar";
import { DataTable } from "@/components/data-table";

type CategoryItem = { id: string; name: string; level: number; sort: number; status: number };

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);

  const load = async () => {
    const res = await http.get("/categories/tree");
    setItems(res.data);
  };
  useEffect(() => {
    void load();
  }, []);

  return (
    <PageShell title="分类库" description="三级分类树管理">
      <FilterBar>
        <input
          className="input input-bordered input-sm"
          placeholder="分类名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="select select-bordered select-sm"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        >
          <option value={1}>一级</option>
          <option value={2}>二级</option>
          <option value={3}>三级</option>
        </select>
        <button
          className="btn btn-primary btn-sm"
          onClick={async () => {
            await http.post("/categories", { name, level });
            setName("");
            await load();
          }}
        >
          新增分类
        </button>
      </FilterBar>
      <DataTable title="分类列表">
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-2 text-sm">
            <span>
              L{c.level} - {c.name}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={async () => {
                await http.delete(`/categories/${c.id}`);
                await load();
              }}
            >
              删除
            </button>
          </div>
        ))}
      </DataTable>
    </PageShell>
  );
}
