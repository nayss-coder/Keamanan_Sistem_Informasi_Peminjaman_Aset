"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Login gagal");
        return;
      }
      // Simpan token di localStorage untuk keperluan API calls
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data));
      router.push("/dashboard");
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(135deg, #0D1425 0%, #111830 60%, #1a2340 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SA</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            SI-ALAT
          </span>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-300 text-xs font-medium">
              Sistem Aktif
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Kelola Peralatan
            <br />
            <span className="text-orange-400">Laboratorium</span>
            <br />
            dengan Mudah
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Peminjaman peralatan lab yang terstruktur, transparan, dan mudah
            dilacak.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Peralatan Terdaftar", value: "10+" },
            { label: "Pengguna Aktif", value: "7" },
            { label: "Peminjaman Hari Ini", value: "4" },
            { label: "Ketersediaan", value: "85%" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-2xl font-bold text-orange-400">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">SA</span>
            </div>
            <span className="font-semibold text-gray-900">SI-ALAT</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Masuk ke Akun
            </h2>
            <p className="text-gray-500 text-sm">
              Gunakan email dan password yang telah terdaftar
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@sialat.ac.id"
                  className="input pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 p-4 rounded-lg bg-white border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Akun Demo
            </p>
            <div className="space-y-1.5">
              {[
                {
                  email: "admin@sialat.ac.id",
                  pass: "admin123",
                  role: "Admin",
                },
                {
                  email: "budi@sialat.ac.id",
                  pass: "dosen123",
                  role: "Dosen PJ",
                },
                {
                  email: "rini@sialat.ac.id",
                  pass: "laboran123",
                  role: "Laboran",
                },
                {
                  email: "andi@student.ac.id",
                  pass: "mhs123",
                  role: "Mahasiswa",
                },
              ].map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(a.pass);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs font-medium text-gray-700">
                      {a.role}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {a.email}
                    </span>
                  </div>
                  <span className="text-xs text-orange-500 opacity-0 group-hover:opacity-100">
                    Pakai →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
