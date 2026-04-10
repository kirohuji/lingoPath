import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "@/modules/http";
import { PageShell } from "@/components/common/page-shell";
import { SearchFilterBar } from "@/components/common/search-filter-bar";
import { DataTable } from "@/components/data-table";
import { FormDialog } from "@/components/form-dialog";

type Episode = { id: string; title: string; content?: string; sort: number; status?: string };
type Textbook = { id: string; title: string; description?: string; episodes: Episode[] };

export default function TextbookManagePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [keyword, setKeyword] = useState("");
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Episode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Episode | null>(null);
  const [form, setForm] = useState({ title: "", content: "", sort: 0 });

  const load = async () => {
    if (!id) return;
    const res = await http.get(`/textbooks/${id}`);
    setTextbook(res.data);
  };

  useEffect(() => {
    void load();
  }, [id]);

  const filteredEpisodes = useMemo(() => {
    const episodes = textbook?.episodes || [];
    const k = keyword.trim().toLowerCase();
    if (!k) return episodes;
    return episodes.filter((ep) => `${ep.title} ${ep.content || ""}`.toLowerCase().includes(k));
  }, [textbook, keyword]);

  return (
    <PageShell
      title={`教材管理 · ${textbook?.title || ""}`}
      description={textbook?.description || "在此管理教材分集（新增/编辑/删除）"}
    >
      <SearchFilterBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索分集标题/内容">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setForm({ title: "", content: "", sort: (textbook?.episodes || []).length });
            setCreateOpen(true);
          }}
        >
          新增分集
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/main/textbooks")}>返回教材列表</button>
      </SearchFilterBar>

      <DataTable
        title="分集列表"
        rows={filteredEpisodes}
        columns={[
          { key: "title", header: "分集标题", render: (ep) => ep.title },
          { key: "content", header: "内容", render: (ep) => ep.content || "-" },
          { key: "sort", header: "排序", render: (ep) => ep.sort },
          {
            key: "actions",
            header: "操作",
            render: (ep) => (
              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => {
                    setEditTarget(ep);
                    setForm({ title: ep.title, content: ep.content || "", sort: ep.sort || 0 });
                  }}
                >
                  编辑
                </button>
                <button className="btn btn-error btn-outline btn-xs" onClick={() => setDeleteTarget(ep)}>删除</button>
              </div>
            ),
          },
        ]}
      />

      <FormDialog
        title="新增分集"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        confirmDisabled={!form.title.trim() || !id}
        onConfirm={async () => {
          if (!id) return;
          await http.post(`/textbooks/${id}/episodes`, {
            title: form.title.trim(),
            content: form.content.trim() || undefined,
            sort: form.sort,
          });
          setCreateOpen(false);
          await load();
        }}
      >
        <div className="space-y-3">
          <input className="input input-bordered w-full" placeholder="分集标题" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <textarea className="textarea textarea-bordered w-full" placeholder="分集内容" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
          <input type="number" className="input input-bordered w-full" placeholder="排序" value={form.sort} onChange={(e) => setForm((p) => ({ ...p, sort: Number(e.target.value) }))} />
        </div>
      </FormDialog>

      <FormDialog
        title="编辑分集"
        open={Boolean(editTarget)}
        onCancel={() => setEditTarget(null)}
        confirmDisabled={!form.title.trim() || !editTarget}
        onConfirm={async () => {
          if (!editTarget) return;
          await http.patch(`/textbooks/episodes/${editTarget.id}`, {
            title: form.title.trim(),
            content: form.content.trim() || undefined,
            sort: form.sort,
          });
          setEditTarget(null);
          await load();
        }}
      >
        <div className="space-y-3">
          <input className="input input-bordered w-full" placeholder="分集标题" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <textarea className="textarea textarea-bordered w-full" placeholder="分集内容" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
          <input type="number" className="input input-bordered w-full" placeholder="排序" value={form.sort} onChange={(e) => setForm((p) => ({ ...p, sort: Number(e.target.value) }))} />
        </div>
      </FormDialog>

      <FormDialog
        title="删除分集"
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        confirmText="确认删除"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await http.delete(`/textbooks/episodes/${deleteTarget.id}`);
          setDeleteTarget(null);
          await load();
        }}
      >
        <p className="text-sm opacity-80">
          {deleteTarget ? `确认删除分集「${deleteTarget.title}」吗？` : ""}
        </p>
      </FormDialog>
    </PageShell>
  );
}
