'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Check, RotateCcw, ClipboardList } from 'lucide-react'
import { Peminjaman, Peralatan } from '@/types'
import { STATUS_PEMINJAMAN_COLOR, STATUS_PEMINJAMAN_LABEL, formatDate } from '@/lib/utils'

export default function PeminjamanPage() {
  const [data, setData]       = useState<Peminjaman[]>([])
  const [alat, setAlat]       = useState<Peralatan[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]         = useState('')
  const [user, setUser]       = useState<{role:string}>({ role:'' })

  const [form, setForm] = useState({
    peralatan_id: '', jumlah: '1',
    tanggal_pinjam: '', tanggal_kembali: '', keperluan: ''
  })

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  function loadData() {
    setLoading(true)
    fetch('/api/peminjaman', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setData(d.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user') || '{}'))
    loadData()
    fetch('/api/peralatan?status=tersedia', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setAlat(d.data) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/peminjaman', { method: 'POST', headers, body: JSON.stringify({ ...form, peralatan_id: Number(form.peralatan_id), jumlah: Number(form.jumlah) }) })
    const d = await res.json()
    setMsg(d.message || d.error)
    if (d.success) { setShowForm(false); loadData() }
  }

  async function handleAction(id: number, action: 'approve' | 'reject' | 'return') {
    await fetch(`/api/peminjaman/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ action }) })
    loadData()
  }

  const canApprove = ['dosen_pj', 'admin'].includes(user.role)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peminjaman</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola permohonan peminjaman peralatan</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Ajukan Peminjaman
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-700">
          {msg}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-gray-900">Form Peminjaman</h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="label">Peralatan</label>
                <select value={form.peralatan_id} onChange={e => setForm({...form, peralatan_id: e.target.value})} className="select" required>
                  <option value="">Pilih peralatan...</option>
                  {alat.map(a => <option key={a.id} value={a.id}>{a.nama} — {a.kode} (tersedia: {a.tersedia})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Jumlah</label>
                <input type="number" min="1" value={form.jumlah} onChange={e => setForm({...form, jumlah: e.target.value})} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tanggal Pinjam</label>
                  <input type="date" value={form.tanggal_pinjam} onChange={e => setForm({...form, tanggal_pinjam: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="label">Tanggal Kembali</label>
                  <input type="date" value={form.tanggal_kembali} onChange={e => setForm({...form, tanggal_kembali: e.target.value})} className="input" required />
                </div>
              </div>
              <div>
                <label className="label">Keperluan</label>
                <textarea value={form.keperluan} onChange={e => setForm({...form, keperluan: e.target.value})}
                  rows={3} placeholder="Jelaskan keperluan peminjaman..." className="input resize-none" required />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1 justify-center">Ajukan Permohonan</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Kode</th><th>Peminjam</th><th>Peralatan</th><th>Jml</th>
                <th>Tgl Pinjam</th><th>Tgl Kembali</th><th>Keperluan</th>
                <th>Status</th>{canApprove && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="text-center py-8 text-gray-400">Memuat data...</td></tr>}
              {!loading && data.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12">
                  <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">Belum ada data peminjaman</p>
                </td></tr>
              )}
              {data.map(p => (
                <tr key={p.id}>
                  <td className="font-mono text-xs text-gray-400">{p.kode_peminjaman}</td>
                  <td className="font-medium text-gray-800">{p.user_name}</td>
                  <td>{p.peralatan_nama}</td>
                  <td className="text-center">{p.jumlah}</td>
                  <td className="text-gray-500 whitespace-nowrap">{formatDate(p.tanggal_pinjam)}</td>
                  <td className="text-gray-500 whitespace-nowrap">{formatDate(p.tanggal_kembali)}</td>
                  <td className="max-w-xs truncate text-gray-500" title={p.keperluan}>{p.keperluan}</td>
                  <td><span className={`badge ${STATUS_PEMINJAMAN_COLOR[p.status]}`}>{STATUS_PEMINJAMAN_LABEL[p.status]}</span></td>
                  {canApprove && (
                    <td>
                      <div className="flex gap-1">
                        {p.status === 'menunggu' && <>
                          <button onClick={() => handleAction(p.id,'approve')} title="Setujui" className="btn-ghost p-1 text-green-600 hover:bg-green-50"><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleAction(p.id,'reject')} title="Tolak" className="btn-ghost p-1 text-red-500 hover:bg-red-50"><X className="w-4 h-4" /></button>
                        </>}
                        {p.status === 'disetujui' && (
                          <button onClick={() => handleAction(p.id,'return')} title="Tandai Dikembalikan" className="btn-ghost p-1 text-blue-500 hover:bg-blue-50"><RotateCcw className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
