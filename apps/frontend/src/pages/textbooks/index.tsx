import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/modules/http";
import { PageShell } from "@/components/common/page-shell";
import { SearchFilterBar } from "@/components/common/search-filter-bar";
import { DataTable } from "@/components/data-table";
import { FormDialog } from "@/components/form-dialog";

type Textbook = { id: string; title: string; description?: string; episodes: { id: string; title: string }[] };
type PageResult<T> = { items: T[]; total: number; page: number; pageSize: number };

export default function TextbooksPage() {
  const navigate = useNavigate();
  const { getRootProps, getInputProps } = useDropzone();
  const [items, setItems] = useState<Textbook[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const res = await http.get<PageResult<Textbook>>("/textbooks", { params: { page, pageSize } });
    setItems(res.data.items);
    setTotal(res.data.total);
  };
  useEffect(() => {
    void load();
  }, [page, pageSize]);

  const filteredItems = items.filter((item) => `${item.title} ${item.description || ""}`.toLowerCase().includes(keyword.trim().toLowerCase()));
  const totalEpisodes = items.reduce((acc, item) => acc + (item.episodes?.length || 0), 0);

  return (
    <PageShell title="教材库" description="教材与分集管理">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card card-border bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="text-xs opacity-70">教材总数</div>
            <div className="text-3xl font-semibold text-primary">{total}</div>
            <div className="text-xs opacity-60">当前分页查询结果</div>
          </div>
        </div>
        <div className="card card-border bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="text-xs opacity-70">分集总数</div>
            <div className="text-3xl font-semibold text-secondary">{totalEpisodes}</div>
            <div className="text-xs opacity-60">本页教材的分集汇总</div>
          </div>
        </div>
        <div className="card card-border bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="text-xs opacity-70">筛选结果</div>
            <div className="text-3xl font-semibold">{filteredItems.length}</div>
            <div className="text-xs opacity-60">关键字: {keyword || "全部"}</div>
          </div>
        </div>
      </div>

      <div className="card card-border bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div
            {...getRootProps()}
            className="rounded-xl border border-dashed border-primary/40 bg-base-100 p-5 transition hover:border-primary/70"
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">教材文件导入</h3>
                <p className="text-sm opacity-70">拖拽文件到此区域，后续可接入解析流水线</p>
              </div>
              <span className="badge badge-primary badge-outline">Upload</span>
            </div>
          </div>
        </div>
      </div>

      <SearchFilterBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索教材标题/描述">
        <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>新增教材</button>
      </SearchFilterBar>

      <DataTable
        title="教材列表"
        rows={filteredItems}
        columns={[
          {
            key: "title",
            header: "教材标题",
            render: (item) => (
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs opacity-60">ID {item.id.slice(0, 8)}</div>
              </div>
            ),
          },
          { key: "description", header: "描述", render: (item) => item.description || "-" },
          {
            key: "episodes",
            header: "分集",
            render: (item) => (
              <div className="flex flex-wrap items-center gap-1">
                {(item.episodes || []).length === 0 ? <span className="opacity-70">无</span> : null}
                {(item.episodes || []).map((ep) => (
                  <span key={ep.id} className="badge badge-outline badge-sm">{ep.title}</span>
                ))}
              </div>
            ),
          },
          {
            key: "actions",
            header: "操作",
            render: (item) => (
              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => navigate(`/main/textbooks/${item.id}`)}
                >
                  管理分集
                </button>
              </div>
            ),
          },
        ]}
        pagination={{ page, pageSize, total, onPageChange: setPage }}
      />
      <FormDialog
        title="新增教材"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        confirmDisabled={!title.trim()}
        onConfirm={async () => {
          await http.post("/textbooks", { title: title.trim(), description: description.trim() });
          setTitle("");
          setDescription("");
          setCreateOpen(false);
          setPage(1);
          await load();
        }}
      >
        <div className="space-y-3">
          <input className="input input-bordered w-full" placeholder="教材标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="textarea textarea-bordered w-full" placeholder="教材描述" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </FormDialog>
    </PageShell>
  );
}
