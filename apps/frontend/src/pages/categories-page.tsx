import { useEffect, useState } from "react";
import { http } from "../modules/http";

type CategoryItem = {
  id: string;
  name: string;
  level: number;
  sort: number;
  status: number;
  parentId?: string | null;
};

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [parentId, setParentId] = useState("");

  const load = async () => {
    const res = await http.get("/categories/tree");
    setItems(res.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    await http.post("/categories", {
      name,
      level,
      parentId: parentId || undefined,
    });
    setName("");
    await load();
  };

  const remove = async (id: string) => {
    await http.delete(`/categories/${id}`);
    await load();
  };

  return (
    <section>
      <h2>分类标签</h2>
      <div>
        <input
          placeholder="分类名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
          <option value={1}>一级</option>
          <option value={2}>二级</option>
          <option value={3}>三级</option>
        </select>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">无父级</option>
          {items
            .filter((c) => c.level < 3)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <button onClick={create}>新增分类</button>
      </div>
      <div style={{ marginTop: 12 }}>
        {items.map((c) => (
          <div key={c.id}>
            L{c.level} - {c.name} / sort:{c.sort} / status:{c.status}
            <button onClick={() => remove(c.id)} style={{ marginLeft: 8 }}>
              删除
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
