"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Package, MapPin, Hash } from "lucide-react";
import { Peralatan } from "@/types";
import { STATUS_PERALATAN_COLOR, STATUS_PERALATAN_LABEL } from "@/lib/utils";

export default function PeralatanPage() {
  const [data, setData] = useState<Peralatan[]>([]);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ role: string }>({ role: "" });

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user") || "{}"));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (kategori) params.set("kategori", kategori);
    if (status) params.set("status", status);
    fetch(`/api/peralatan?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, [search, kategori, status]);

  const canManage = ["laboran", "admin"].includes(user.role);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Peralatan</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Inventaris peralatan laboratorium
          </p>
        </div>
        {canManage && (
          <button className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Peralatan
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau kode peralatan..."
              className="input pl-9"
            />
          </div>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="select w-full sm:w-44"
          >
            <option value="">Semua Kategori</option>
            {[
              "Komputer",
              "Proyektor",
              "Elektronika",
              "Kamera",
              "Jaringan",
              "Aksesoris",
            ].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select w-full sm:w-40"
          >
            <option value="">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="dipinjam">Dipinjam</option>
            <option value="rusak">Rusak</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            Tidak ada peralatan ditemukan
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Coba ubah filter pencarian
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((p) => (
            <div
              key={p.id}
              className="card p-5 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-orange-500" />
                </div>
                <span className={`badge ${STATUS_PERALATAN_COLOR[p.status]}`}>
                  {STATUS_PERALATAN_LABEL[p.status]}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5 leading-snug">
                {p.nama}
              </h3>
              <p className="text-xs text-gray-400 mb-3">{p.kategori}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Hash className="w-3 h-3" />
                  <span className="font-mono">{p.kode}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{p.lokasi}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Tersedia:{" "}
                  <strong className="text-gray-700">
                    {p.tersedia}/{p.jumlah}
                  </strong>
                </span>
                {p.status === "tersedia" && (
                  <a
                    href="/peminjaman"
                    className="text-xs text-orange-500 font-medium hover:text-orange-600"
                  >
                    Pinjam
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
