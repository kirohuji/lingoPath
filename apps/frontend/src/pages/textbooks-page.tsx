import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";

export default function TextbooksPage() {
  const { getRootProps, getInputProps } = useDropzone();
  const demo = "# 教材描述\n\n支持 markdown 预览。";

  return (
    <section>
      <h2>教材库</h2>
      <div {...getRootProps()} style={{ border: "1px dashed #bbb", padding: 12 }}>
        <input {...getInputProps()} />
        拖拽上传教材文件
      </div>
      <ReactMarkdown>{demo}</ReactMarkdown>
    </section>
  );
}
