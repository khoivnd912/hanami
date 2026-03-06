"use client";

import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Eye, EyeOff, Save, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [tab,         setTab]         = useState<"profile" | "security" | "notifications">("profile");
  const [name,        setName]        = useState("Admin");
  const [email,       setEmail]       = useState("");
  const [oldPwd,      setOldPwd]      = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [showOld,     setShowOld]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [notifyOrder, setNotifyOrder] = useState(true);
  const [notifyLow,   setNotifyLow]   = useState(true);

  // Load saved values from localStorage on mount
  useEffect(() => {
    const savedName  = localStorage.getItem("admin_display_name");
    const savedEmail = localStorage.getItem("admin_email");
    if (savedName)  setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  function saveProfile() {
    localStorage.setItem("admin_display_name", name);
    localStorage.setItem("admin_email",        email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TABS = [
    { id: "profile"       as const, label: "Hồ sơ",         icon: User   },
    { id: "security"      as const, label: "Bảo mật",        icon: Shield },
    { id: "notifications" as const, label: "Thông báo",      icon: Bell   },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#f9a8d4,#db2777)" }}>
          <Settings size={17} className="text-white" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Cài đặt</h1>
      </div>

      <div className="flex gap-5">
        {/* Sidebar tabs */}
        <div className="w-44 flex-shrink-0 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                tab === id ? "text-white font-medium" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
              style={tab === id ? { background: "rgba(249,168,212,0.28)" } : {}}>
              <Icon size={15} className={tab === id ? "text-pink-400" : "text-gray-500"} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 rounded-2xl border p-5"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(249,168,212,0.20)" }}>

          {tab === "profile" && (
            <div className="space-y-4 max-w-sm">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Thông tin tài khoản</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#f9a8d4,#db2777)" }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{name}</p>
                  <p className="text-xs text-gray-400">Admin</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tên hiển thị</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400" />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  placeholder="admin@hanami.vn"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-400" />
              </div>

              <button onClick={saveProfile}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: "linear-gradient(135deg,#f9a8d4,#db2777)" }}>
                {saved ? <><CheckCircle size={14} /> Đã lưu</> : <><Save size={14} /> Lưu thay đổi</>}
              </button>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-4 max-w-sm">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Bảo mật tài khoản</h2>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input type={showOld ? "text" : "password"} value={oldPwd}
                    onChange={(e) => setOldPwd(e.target.value)}
                    className="w-full pr-10 px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400" />
                  <button type="button" onClick={() => setShowOld(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Mật khẩu mới</label>
                <div className="relative">
                  <input type={showNew ? "text" : "password"} value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full pr-10 px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400" />
                  <button type="button" onClick={() => setShowNew(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white opacity-50 cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#f9a8d4,#db2777)" }}
                title="Chức năng này cần tích hợp với API">
                Đổi mật khẩu
              </button>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Xác thực 2 bước (TOTP)</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Sử dụng ứng dụng Google Authenticator để tăng cường bảo mật.
                </p>
                <button
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white opacity-50 cursor-not-allowed"
                  style={{ background: "rgba(249,168,212,0.35)" }}
                  title="Truy cập /admin/auth/totp/setup qua API">
                  Cài đặt 2FA
                </button>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-4 max-w-sm">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Tùy chọn thông báo</h2>

              {[
                { label: "Thông báo đơn hàng mới", desc: "Nhận email khi có đơn hàng mới", value: notifyOrder, set: setNotifyOrder },
                { label: "Cảnh báo tồn kho thấp", desc: "Thông báo khi sản phẩm sắp hết", value: notifyLow,   set: setNotifyLow },
              ].map(({ label, desc, value, set }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <button onClick={() => set(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                      value ? "bg-pink-500" : "bg-white/10"
                    }`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              ))}

              <p className="text-xs text-gray-500 pt-2">
                Cài đặt thông báo được lưu cục bộ. Tích hợp email yêu cầu cấu hình Resend API.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
