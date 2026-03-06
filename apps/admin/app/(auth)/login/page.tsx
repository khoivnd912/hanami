"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Eye, EyeOff, Flower2, Lock, Mail, ShieldCheck } from "lucide-react";

type Step = "credentials" | "totp";

export default function LoginPage() {
  const router = useRouter();

  const [step,      setStep]      = useState<Step>("credentials");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [totp,      setTotp]      = useState("");
  const [tempToken, setTempToken] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // ── Step 1: credentials ────────────────────────────────────────────────────
  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.requires2FA && res.tempToken) {
        setTempToken(res.tempToken);
        setStep("totp");
      } else if (res.accessToken) {
        localStorage.setItem("admin_token", res.accessToken);
        router.replace("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: TOTP ──────────────────────────────────────────────────────────
  async function handleTotp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await api.verifyTotp(tempToken, totp);
      localStorage.setItem("admin_token", res.accessToken);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mã xác thực không đúng");
      setTotp("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #3d0b22 0%, #831843 50%, #db2777 100%)" }}
    >
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center"
          style={{ background: "linear-gradient(135deg, #fdf5f0 0%, #fce7f3 100%)" }}
        >
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f9a8d4, #db2777)" }}
            >
              <Flower2 size={26} className="text-white" />
            </div>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "#3d0b22" }}>Hanami Admin</h1>
          <p className="text-xs mt-1" style={{ color: "#db2777" }}>
            {step === "credentials" ? "Đăng nhập vào trang quản trị" : "Xác thực hai yếu tố"}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all"
                    style={{ borderColor: "#e2e8f0" }}
                    onFocus={(e) => { e.target.style.borderColor = "#f9a8d4"; e.target.style.boxShadow = "0 0 0 3px rgba(249,168,212,0.20)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                    placeholder="admin@hanami.vn"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? "text" : "password"} required autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-sm border rounded-xl outline-none transition-all"
                    style={{ borderColor: "#e2e8f0" }}
                    onFocus={(e) => { e.target.style.borderColor = "#f9a8d4"; e.target.style.boxShadow = "0 0 0 3px rgba(249,168,212,0.20)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60 mt-2"
                style={{ background: "linear-gradient(135deg, #f9a8d4, #db2777)" }}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTotp} className="space-y-4">
              <div className="text-center mb-2">
                <ShieldCheck size={32} className="mx-auto mb-2" style={{ color: "#f9a8d4" }} />
                <p className="text-sm text-gray-600">
                  Nhập mã 6 chữ số từ ứng dụng xác thực của bạn
                </p>
              </div>

              <div>
                <input
                  type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                  required autoFocus
                  value={totp} onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-2xl tracking-[0.5em] py-3 border rounded-xl outline-none font-mono transition-all"
                  style={{ borderColor: "#e2e8f0" }}
                  onFocus={(e) => { e.target.style.borderColor = "#f9a8d4"; e.target.style.boxShadow = "0 0 0 3px rgba(249,168,212,0.20)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                  placeholder="000000"
                />
              </div>

              <button type="submit" disabled={loading || totp.length < 6}
                className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #f9a8d4, #db2777)" }}
              >
                {loading ? "Đang xác thực..." : "Xác nhận"}
              </button>

              <button type="button" onClick={() => { setStep("credentials"); setError(""); }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-1"
              >
                ← Quay lại
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-[10px] text-gray-400">Chỉ dành cho nhân viên Hanami · Phiên làm việc: 4 giờ</p>
        </div>
      </div>
    </div>
  );
}
