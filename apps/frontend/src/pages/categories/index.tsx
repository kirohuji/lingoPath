import { useEffect, useMemo, useState } from "react";
import { http } from "@/modules/http";
import { PageShell } from "@/components/common/page-shell";
import { SearchFilterBar } from "@/components/common/search-filter-bar";
import { FormDialog } from "@/components/form-dialog";

type CategoryItem = {
  id: string;
  parentId?: string | null;
  name: string;
  level: number;
  sort: number;
  status: number;
};

type CategoryNode = CategoryItem & { children: CategoryNode[] };

function CategoryTree({
  nodes,
  onStartEdit,
  onStartAddChild,
  onDelete,
}: {
  nodes: CategoryNode[];
  onStartEdit: (node: CategoryNode) => void;
  onStartAddChild: (node: CategoryNode) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  if (nodes.length === 0) {
    return <div className="text-sm opacity-70">暂无数据</div>;
  }

  return (
    <ul className="space-y-3">
      {nodes.map((node) => (
        <li key={node.id}>
          <details open={node.level === 1}>
            <summary className="list-none rounded-xl border border-base-300 bg-base-100 p-0 shadow-sm transition hover:border-primary/30 hover:shadow">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                  {node.level}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{node.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs opacity-70">
                    <span>ID {node.id.slice(0, 6)}</span>
                    <span>排序 {node.sort}</span>
                    <span>子节点 {node.children.length}</span>
                  </div>
                </div>
                <span className={`badge badge-sm ${node.status === 1 ? "badge-success" : "badge-warning"}`}>
                  {node.status === 1 ? "启用" : "停用"}
                </span>
                <div className="ml-1 flex items-center gap-1">
                  {node.level < 3 ? (
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onStartAddChild(node);
                      }}
                    >
                      新增子节点
                    </button>
                  ) : null}
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onStartEdit(node);
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-error btn-outline btn-xs"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      await onDelete(node.id);
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            </summary>
            <div className="ml-3 mt-2 border-l-2 border-dashed border-base-300 pl-4">
              <CategoryTree
                nodes={node.children}
                onStartEdit={onStartEdit}
                onStartAddChild={onStartAddChild}
                onDelete={onDelete}
              />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [rootForm, setRootForm] = useState({ name: "", level: 1, sort: 0 });
  const [editingNode, setEditingNode] = useState<CategoryNode | null>(null);
  const [editingForm, setEditingForm] = useState({ name: "", sort: 0, status: 1 });
  const [addingParent, setAddingParent] = useState<CategoryNode | null>(null);
  const [addingForm, setAddingForm] = useState({ name: "", sort: 0 });

  const load = async () => {
    const res = await http.get("/categories/tree");
    setItems(res.data);
  };
  useEffect(() => {
    void load();
  }, []);

  const tree = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    items
      .slice()
      .sort((a, b) => a.level - b.level || a.sort - b.sort)
      .forEach((item) => {
        map.set(item.id, { ...item, children: [] });
      });

    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    if (!k) return roots;

    const filterNode = (node: CategoryNode): CategoryNode | null => {
      const children = node.children.map(filterNode).filter(Boolean) as CategoryNode[];
      const matched = node.name.toLowerCase().includes(k);
      if (!matched && children.length === 0) return null;
      return { ...node, children };
    };

    return roots.map(filterNode).filter(Boolean) as CategoryNode[];
  }, [items, keyword]);

  return (
    <PageShell title="分类库" description="三级分类树管理">
      <SearchFilterBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索分类名">
        <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>新增节点</button>
      </SearchFilterBar>
      <div className="card card-border bg-base-100">
        <div className="card-body p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">分类树</h3>
            <span className="badge badge-ghost">共 {items.length} 个节点</span>
          </div>
          <CategoryTree
            nodes={tree}
            onStartEdit={(node) => {
              setEditingNode(node);
              setEditingForm({ name: node.name, sort: node.sort, status: node.status });
            }}
            onStartAddChild={(node) => {
              if (node.level >= 3) return;
              setAddingParent(node);
              setAddingForm({ name: "", sort: 0 });
            }}
            onDelete={async (id) => {
              await http.delete(`/categories/${id}`);
              await load();
            }}
          />
        </div>
      </div>

      <FormDialog
        title="新增分类节点"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        confirmDisabled={!rootForm.name.trim()}
        onConfirm={async () => {
          await http.post("/categories", { name: rootForm.name.trim(), level: rootForm.level, sort: rootForm.sort });
          setRootForm({ name: "", level: 1, sort: 0 });
          setCreateOpen(false);
          await load();
        }}
      >
        <div className="space-y-3">
          <input
            className="input input-bordered w-full"
            placeholder="名称"
            value={rootForm.name}
            onChange={(e) => setRootForm((p) => ({ ...p, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="select select-bordered"
              value={rootForm.level}
              onChange={(e) => setRootForm((p) => ({ ...p, level: Number(e.target.value) }))}
            >
              <option value={1}>一级</option>
              <option value={2}>二级</option>
              <option value={3}>三级</option>
            </select>
            <input
              type="number"
              className="input input-bordered"
              placeholder="排序"
              value={rootForm.sort}
              onChange={(e) => setRootForm((p) => ({ ...p, sort: Number(e.target.value) }))}
            />
          </div>
        </div>
      </FormDialog>

      <FormDialog
        title={editingNode ? `编辑节点（L${editingNode.level}）` : "编辑节点"}
        open={Boolean(editingNode)}
        onCancel={() => setEditingNode(null)}
        confirmDisabled={!editingForm.name.trim()}
        onConfirm={async () => {
          if (!editingNode) return;
          await http.patch(`/categories/${editingNode.id}`, editingForm);
          setEditingNode(null);
          await load();
        }}
      >
        <div className="space-y-3">
          <input
            className="input input-bordered w-full"
            placeholder="名称"
            value={editingForm.name}
            onChange={(e) => setEditingForm((p) => ({ ...p, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="input input-bordered"
              placeholder="排序"
              value={editingForm.sort}
              onChange={(e) => setEditingForm((p) => ({ ...p, sort: Number(e.target.value) }))}
            />
            <select
              className="select select-bordered"
              value={editingForm.status}
              onChange={(e) => setEditingForm((p) => ({ ...p, status: Number(e.target.value) }))}
            >
              <option value={1}>启用</option>
              <option value={0}>停用</option>
            </select>
          </div>
        </div>
      </FormDialog>

      <FormDialog
        title="新增子节点"
        open={Boolean(addingParent)}
        onCancel={() => setAddingParent(null)}
        confirmDisabled={!addingForm.name.trim()}
        onConfirm={async () => {
          if (!addingParent) return;
          await http.post("/categories", {
            parentId: addingParent.id,
            level: addingParent.level + 1,
            name: addingForm.name.trim(),
            sort: addingForm.sort,
          });
          setAddingParent(null);
          setAddingForm({ name: "", sort: 0 });
          await load();
        }}
      >
        <p className="mb-3 text-sm opacity-70">
          {addingParent ? `${addingParent.name}（L${addingParent.level}）下新增 L${addingParent.level + 1}` : ""}
        </p>
        <div className="space-y-3">
          <input
            className="input input-bordered w-full"
            placeholder="子节点名称"
            value={addingForm.name}
            onChange={(e) => setAddingForm((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="排序"
            value={addingForm.sort}
            onChange={(e) => setAddingForm((p) => ({ ...p, sort: Number(e.target.value) }))}
          />
        </div>
      </FormDialog>
    </PageShell>
  );
}
