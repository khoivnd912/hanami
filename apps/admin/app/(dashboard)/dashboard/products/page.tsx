"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type AdminProduct, type PaginatedProducts } from "@/lib/api";
import { formatVND, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, X, Save, AlertCircle, ImageOff } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import { ImageUpload } from "@/components/ImageUpload";

const TAG_OPTIONS = ["", "New", "Bestseller", "Seasonal", "Exclusive", "Limited"];
const VALID_TAGS  = new Set(TAG_OPTIONS.filter(Boolean));

/** Normalise legacy lowercase/invalid tags from old seeded records. */
function normalizeTag(raw?: string | null): string {
  if (!raw) return "";
  if (VALID_TAGS.has(raw)) return raw;                          // already valid
  const titled = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return VALID_TAGS.has(titled) ? titled : "";                  // e.g. "bestseller"→"Bestseller", "sale"→""
}

const EMPTY_FORM = {
  slug: "", nameVi: "", nameEn: "", price: "", originalPrice: "",
  tag: "", stock: "", isActive: true,
  imageUrl: "",
  descriptionVi: "", descriptionEn: "",
};

/** Thumbnail shown in the table row */
function ProductThumb({ product }: { product: AdminProduct }) {
  if (product.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imageUrl}
        alt={product.nameVi}
        className="w-10 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
      />
    );
  }
  if (product.gradient) {
    return (
      <div className="w-10 h-12 rounded-lg flex-shrink-0" style={{ background: product.gradient }} />
    );
  }
  return (
    <div className="w-10 h-12 rounded-lg flex-shrink-0 bg-gray-100 flex items-center justify-center">
      <ImageOff size={14} className="text-gray-300" />
    </div>
  );
}

export default function ProductsPage() {
  const [data,     setData]     = useState<PaginatedProducts | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [limit,    setLimit]    = useState(20);
  const [search,   setSearch]   = useState("");
  const [editing,  setEditing]  = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit), includeInactive: "1" };
      if (search) params.q = search;
      setData(await api.getProducts(params));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(EMPTY_FORM); setEditing(null);
    setCreating(true); setError("");
  }

  function openEdit(p: AdminProduct) {
    setForm({
      slug: p.slug, nameVi: p.nameVi, nameEn: p.nameEn,
      price: String(p.price), originalPrice: String(p.originalPrice ?? ""),
      tag: normalizeTag(p.tag),           // fix legacy lowercase tags
      stock: String(p.stock),
      isActive: p.isActive,
      imageUrl: p.imageUrl ?? "",
      descriptionVi: "", descriptionEn: "",
    });
    setEditing(p); setCreating(true); setError("");
  }

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const validTag = VALID_TAGS.has(form.tag) ? form.tag : undefined;
      const payload: Record<string, unknown> = {
        slug:          form.slug,
        nameVi:        form.nameVi,
        nameEn:        form.nameEn,
        price:         Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        tag:           validTag,
        stock:         Number(form.stock),
        isActive:      form.isActive,
        imageUrl:      form.imageUrl || undefined,
      };
      // Only include description arrays when they carry content
      // (avoids wiping existing descriptions on quick edits)
      if (form.descriptionVi) payload.descriptionVi = form.descriptionVi.split("\n").filter(Boolean);
      if (form.descriptionEn) payload.descriptionEn = form.descriptionEn.split("\n").filter(Boolean);
      // Never send specs from this form — the field has its own editor
      // Omitting it means Mongoose's findByIdAndUpdate won't touch existing specs
      if (editing) {
        await api.updateProduct(editing._id, payload);
      } else {
        await api.createProduct(payload);
      }
      setCreating(false); setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Bạn chắc chắn muốn ẩn sản phẩm này?")) return;
    try {
      await api.deactivateProduct(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi ẩn sản phẩm");
    }
  }

  const set = (k: keyof typeof EMPTY_FORM) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Products list ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-gray-900">Sản phẩm</h1>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "#f4b6c2", color: "#333333" }}
            >
              <Plus size={14} /> Thêm sản phẩm
            </button>
          </div>
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm sản phẩm..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-pink-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sản phẩm</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Giá</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tồn kho</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Tag</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Ngày tạo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.items.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumb product={p} />
                        <div>
                          <p className="font-medium text-gray-900">{p.nameVi}</p>
                          <p className="text-xs text-gray-400">{p.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatVND(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        p.stock === 0 ? "bg-red-100 text-red-700" :
                        p.stock <= 5  ? "bg-amber-100 text-amber-700" :
                                        "bg-emerald-100 text-emerald-700"
                      )}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.tag && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">{p.tag}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full",
                        p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {p.isActive ? "Đang bán" : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                        >
                          <Edit2 size={13} />
                        </button>
                        {p.isActive && (
                          <button onClick={() => handleDeactivate(p._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && (
          <Pagination
            page={page}
            pages={data.pages}
            total={data.total}
            limit={limit}
            loading={loading}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        )}
      </div>

      {/* ── Product form drawer ────────────────────────────────────────────── */}
      {creating && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setCreating(false)} />
          <div className="fixed right-0 inset-y-0 w-full max-w-sm z-40 lg:static lg:w-96 lg:max-w-none border-l border-gray-100 bg-white flex flex-col overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
            <button onClick={() => setCreating(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Image upload */}
            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            />

            {/* Text fields */}
            {[
              { label: "Slug *",             key: "slug",          placeholder: "night-rose" },
              { label: "Tên tiếng Việt *",   key: "nameVi",        placeholder: "Đêm Hoa Hồng" },
              { label: "Tên tiếng Anh *",    key: "nameEn",        placeholder: "Night Rose Lamp" },
              { label: "Giá (VND) *",        key: "price",         placeholder: "890000" },
              { label: "Giá gốc (VND)",      key: "originalPrice", placeholder: "1000000" },
              { label: "Số lượng tồn kho *", key: "stock",         placeholder: "10" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
                <input
                  type="text"
                  value={(form as Record<string, unknown>)[key] as string}
                  onChange={(e) => set(key as keyof typeof EMPTY_FORM)(e.target.value)}
                  placeholder={placeholder}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-pink-400 transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Tag</label>
              <select value={form.tag} onChange={(e) => set("tag")(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-pink-400"
              >
                {TAG_OPTIONS.map((t) => <option key={t} value={t}>{t || "Không có"}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Mô tả (VI, mỗi đoạn 1 dòng)</label>
              <textarea value={form.descriptionVi} onChange={(e) => set("descriptionVi")(e.target.value)}
                rows={3} placeholder="Mô tả sản phẩm..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-pink-400 resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => set("isActive")(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Đang bán</span>
            </label>
          </div>

          <div className="px-5 py-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
              style={{ background: "#f4b6c2", color: "#333333" }}
            >
              <Save size={14} />
              {saving ? "Đang lưu..." : (editing ? "Cập nhật" : "Tạo sản phẩm")}
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
