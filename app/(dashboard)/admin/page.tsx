'use client'
import { useEffect, useState } from 'react'
import { Users, Shield, ShieldAlert } from 'lucide-react'
import { User } from '@/types'
import { ROLE_LABEL, formatDateTime } from '@/lib/utils'

const ROLE_BADGE: Record<string, string> = {
  admin:        'bg-red-100 text-red-800',
  dosen_pj:     'bg-purple-100 text-purple-800',
  laboran:      'bg-blue-100 text-blue-800',
  asisten_lab:  'bg-teal-100 text-teal-800',
  mahasiswa:    'bg-gray-100 text-gray-700',
}

export default function AdminPage() {
  const [users, setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.status === 403) { setForbidden(true); return null } return r.json() })
      .then(d => { if (d?.success) setUsers(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (forbidden) return (
    <div className="card p-16 text-center">
      <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Akses Ditolak</h2>
      <p className="text-gray-500 text-sm">Halaman ini hanya dapat diakses oleh Administrator.</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-sm mt-0.5">Daftar seluruh pengguna sistem SI-ALAT</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
          <Shield className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-700">Admin Only</span>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Nama</th><th>Email</th><th>NIM/NIP</th>
                <th>Role</th><th>Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Memuat data...</td></tr>}
              {!loading && users.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">Belum ada data pengguna</p>
                </td></tr>
              )}
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td className="text-gray-400 text-xs w-8">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-700 text-xs font-semibold">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-500">{u.email}</td>
                  <td className="font-mono text-xs text-gray-500">{u.nim_nip || '—'}</td>
                  <td>
                    <span className={`badge ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-700'}`}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td className="text-gray-400 text-xs whitespace-nowrap">{formatDateTime(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
