import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { http } from "../modules/http";

type Episode = { id: string; title: string; status: string };
type Textbook = { id: string; title: string; description?: string; episodes: Episode[] };

export default function TextbooksPage() {
  const { getRootProps, getInputProps } = useDropzone();
  const [items, setItems] = useState<Textbook[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [currentTextbookId, setCurrentTextbookId] = useState("");
  const demo = description || "# 教材描述\n\n支持 markdown 预览。";

  const load = async () => {
    const res = await http.get("/textbooks");
    setItems(res.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const createTextbook = async () => {
    await http.post("/textbooks", { title, description });
    setTitle("");
    setDescription("");
    await load();
  };

  const addEpisode = async () => {
    if (!currentTextbookId || !episodeTitle) return;
    await http.post(`/textbooks/${currentTextbookId}/episodes`, { title: episodeTitle });
    setEpisodeTitle("");
    await load();
  };

  const removeTextbook = async (id: string) => {
    await http.delete(`/textbooks/${id}`);
    await load();
  };

  return (
    <section>
      <h2>教材库</h2>
      <div {...getRootProps()} style={{ border: "1px dashed #bbb", padding: 12 }}>
        <input {...getInputProps()} />
        拖拽上传教材文件
      </div>
      <div style={{ marginTop: 12 }}>
        <input
          placeholder="教材标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="教材描述"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={createTextbook}>新增教材</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <select value={currentTextbookId} onChange={(e) => setCurrentTextbookId(e.target.value)}>
          <option value="">选择教材后新增分集</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <input
          placeholder="分集标题"
          value={episodeTitle}
          onChange={(e) => setEpisodeTitle(e.target.value)}
        />
        <button onClick={addEpisode}>新增分集</button>
      </div>
      <ReactMarkdown>{demo}</ReactMarkdown>
      <div style={{ marginTop: 12 }}>
        {items.map((item) => (
          <div key={item.id} style={{ marginBottom: 8 }}>
            <strong>{item.title}</strong> - {item.description || "-"}
            <button style={{ marginLeft: 8 }} onClick={() => removeTextbook(item.id)}>
              删除教材
            </button>
            <div>
              分集：
              {(item.episodes || []).map((ep) => ep.title).join(", ") || "无"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
