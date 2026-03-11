"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, ImagePlus, Pencil, Trash2, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB   = 5;
const MAX_SIZE = MAX_MB * 1024 * 1024;

interface Props {
  value:     string;
  onChange:  (url: string) => void;
  label?:    string;           // custom label; pass "" to hide label
  variant?:  "default" | "avatar"; // avatar → circular compact preview
}

export function ImageUpload({ value, onChange, label = "Ảnh sản phẩm", variant = "default" }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [drag,    setDrag]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return "Chỉ chấp nhận JPG, PNG, WEBP";
    if (file.size > MAX_SIZE)          return `Dung lượng tối đa ${MAX_MB} MB`;
    return null;
  };

  const upload = useCallback(async (file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }

    setError(""); setLoading(true); setDone(false);
    try {
      const { url } = await api.uploadImage(file);
      onChange(url);
      setDone(true);
      setTimeout(() => setDone(false), 2400);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải ảnh");
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";   // reset so same file can be re-selected
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  // ── With image preview ────────────────────────────────────────────────────
  if (value) {
    const thumbCls = variant === "avatar"
      ? "w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-pink-200 bg-white"
      : "w-14 h-[72px] rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-white";

    return (
      <div className="w-full min-w-0">
        {label && <label className="text-xs font-medium text-gray-500 block mb-2">{label}</label>}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden min-w-0">
          {/* Thumbnail */}
          <div className={thumbCls}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>

          {/* Info + actions */}
          <div className="flex-1 min-w-0">
            {done ? (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mb-1">
                <CheckCircle2 size={13} /> Đã tải lên thành công
              </p>
            ) : (
              <p className="text-[10px] text-gray-500 truncate mb-1">{value.split("/").pop()}</p>
            )}

            {error && (
              <p className="flex items-center gap-1 text-[10px] text-red-600 mb-1.5">
                <AlertCircle size={11} /> {error}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-white border border-gray-200 text-gray-600 hover:border-pink-400 hover:text-pink-600 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={10} className="animate-spin" /> : <Pencil size={10} />}
                Thay
              </button>
              <button
                type="button"
                onClick={() => { onChange(""); setError(""); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-white border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                <Trash2 size={10} /> Xóa
              </button>
            </div>
          </div>
        </div>

        <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} onChange={onFileChange} className="hidden" />
      </div>
    );
  }

  // ── Empty / drop zone ─────────────────────────────────────────────────────
  return (
    <div className="w-full min-w-0">
      {label && <label className="text-xs font-medium text-gray-500 block mb-2">{label}</label>}

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={[
          "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-all duration-200 select-none",
          drag
            ? "border-pink-400 bg-pink-50 scale-[1.01]"
            : "border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50/40",
          loading ? "pointer-events-none" : "",
        ].join(" ")}
      >
        {loading ? (
          <>
            <Loader2 size={28} className="text-pink-400 animate-spin" />
            <p className="text-xs text-gray-500">Đang tải lên…</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#fae8ee,#f9d5e2)" }}>
              {drag ? <Upload size={18} className="text-pink-500" /> : <ImagePlus size={18} className="text-pink-400" />}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">
                {drag ? "Thả file vào đây" : "Kéo & thả hoặc click để chọn"}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP · tối đa {MAX_MB} MB</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} onChange={onFileChange} className="hidden" />
    </div>
  );
}
