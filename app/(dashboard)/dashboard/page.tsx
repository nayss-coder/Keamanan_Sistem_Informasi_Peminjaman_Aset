'use client'
import { useEffect, useState } from 'react'
import { Package, ClipboardList, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { DashboardStats, Peminjaman } from '@/types'
import { STATUS_PEMINJAMAN_COLOR, STATUS_PEMINJAMAN_LABEL, formatDate } from '@/lib/utils'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType, label: string, value: number | string,
  sub?: string, color: string
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats]   = useState<DashboardStats | null>(null)
  const [recent, setRecent] = useState<Peminjaman[]>([])
  const [user, setUser]     = useState<{name:string, role:string}>({ name:'', role:'' })

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(u)
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    fetch('/api/admin/stats', { headers }).then(r => r.json()).then(d => { if (d.success) setStats(d.data) })
    fetch('/api/peminjaman', { headers }).then(r => r.json()).then(d => { if (d.success) setRecent(d.data?.slice(0,5) || []) })
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, <span className="text-orange-500">{user.name?.split(' ')[0] || 'Pengguna'}</span> 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Berikut ringkasan kondisi peralatan laboratorium hari ini.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Package}       label="Total Peralatan"  value={stats?.totalPeralatan || 0}     color="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle}   label="Tersedia"         value={stats?.peralatanTersedia || 0}  color="bg-green-50 text-green-600" />
        <StatCard icon={TrendingUp}    label="Sedang Dipinjam"  value={stats?.peralatanDipinjam || 0}  color="bg-orange-50 text-orange-600" />
        <StatCard icon={ClipboardList} label="Total Peminjaman" value={stats?.totalPeminjaman || 0}    color="bg-purple-50 text-purple-600" />
        <StatCard icon={Clock}         label="Menunggu Approval" value={stats?.peminjamanMenunggu || 0} color="bg-amber-50 text-amber-600" />
        <StatCard icon={AlertTriangle} label="Aktif Dipinjam"   value={stats?.peminjamanAktif || 0}   color="bg-red-50 text-red-500" />
      </div>

      {/* Recent peminjaman */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-900">Peminjaman Terbaru</h2>
          <a href="/peminjaman" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Lihat semua →</a>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Kode</th><th>Peminjam</th><th>Peralatan</th>
                <th>Tgl Pinjam</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">Belum ada data peminjaman</td></tr>
              )}
              {recent.map(p => (
                <tr key={p.id}>
                  <td className="font-mono text-xs text-gray-500">{p.kode_peminjaman}</td>
                  <td className="font-medium text-gray-800">{p.user_name}</td>
                  <td>{p.peralatan_nama}</td>
                  <td className="text-gray-500">{formatDate(p.tanggal_pinjam)}</td>
                  <td>
                    <span className={`badge ${STATUS_PEMINJAMAN_COLOR[p.status]}`}>
                      {STATUS_PEMINJAMAN_LABEL[p.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
