import { useState } from "react";

type AvatarUploadProps = {
  value?: string;
  label?: string;
  onChange: (nextValue: string) => void;
};

export function AvatarUpload({ value, label = "上传头像", onChange }: AvatarUploadProps) {
  const [errorText, setErrorText] = useState("");

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorText("图片大小不能超过 5MB");
      return;
    }
    setErrorText("");
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-3">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="size-14 rounded-full border border-base-300 bg-base-200">
            {value ? <img src={value} alt="avatar-preview" /> : <div className="grid size-full place-items-center text-xs opacity-60">头像</div>}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="mt-2 flex gap-2">
            <label className="btn btn-outline btn-sm">
              选择图片
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
            </label>
            {value ? (
              <button className="btn btn-ghost btn-sm" onClick={() => onChange("")}>
                清空
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-xs opacity-60">支持 jpg/png/webp，本地预览</p>
          {errorText ? <p className="mt-1 text-xs text-error">{errorText}</p> : null}
        </div>
      </div>
    </div>
  );
}
