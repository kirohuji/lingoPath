import { useEffect, useState } from "react";
import { http } from "../modules/http";

type Ticket = {
  id: string;
  subject: string;
  content: string;
  status: string;
  priority: string;
  replies?: { id: string; content: string }[];
};

export default function TicketsPage() {
  const [items, setItems] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [currentTicketId, setCurrentTicketId] = useState("");

  const load = async () => {
    const res = await http.get("/tickets");
    setItems(res.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const createTicket = async () => {
    await http.post("/tickets", { subject, content });
    setSubject("");
    setContent("");
    await load();
  };

  const changeStatus = async (id: string, status: string) => {
    await http.patch(`/tickets/${id}/status`, { status });
    await load();
  };

  const reply = async () => {
    if (!currentTicketId || !replyContent) return;
    await http.post(`/tickets/${currentTicketId}/replies`, { content: replyContent });
    setReplyContent("");
    await load();
  };

  return (
    <section>
      <h2>工单管理</h2>
      <div>
        <input
          placeholder="工单主题"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          placeholder="工单内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={createTicket}>新建工单</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <select value={currentTicketId} onChange={(e) => setCurrentTicketId(e.target.value)}>
          <option value="">选择工单回复</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.subject}
            </option>
          ))}
        </select>
        <input
          placeholder="回复内容"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
        />
        <button onClick={reply}>提交回复</button>
      </div>
      <div style={{ marginTop: 12 }}>
        {items.map((item) => (
          <div key={item.id} style={{ marginBottom: 8 }}>
            <strong>{item.subject}</strong> / {item.status} / {item.priority}
            <button style={{ marginLeft: 8 }} onClick={() => changeStatus(item.id, "processing")}>
              处理
            </button>
            <button style={{ marginLeft: 8 }} onClick={() => changeStatus(item.id, "resolved")}>
              解决
            </button>
            <div>{item.content}</div>
            <div>回复数: {item.replies?.length || 0}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
