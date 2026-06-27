'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { FileText, Check, X, ShieldAlert, Image as ImageIcon, Eye } from 'lucide-react';

export default function AdminNovelCreatorApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/admin/novel-creator-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Siz rostdan ham ushbu arizani tasdiqlamoqchimisiz? Bu foydalanuvchining rolini Novel Creator ga o'zgartiradi va obunani 30 kunga faollashtiradi/uzaytiradi.")) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/admin/novel-creator-applications/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setApplications(apps => apps.map(app => 
          app.id === id ? { ...app, status: 'approved' } : app
        ));
      } else {
        const data = await res.json();
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi");
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !adminNote.trim()) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/admin/novel-creator-applications/${rejectingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ admin_note: adminNote })
      });
      
      if (res.ok) {
        setApplications(apps => apps.map(app => 
          app.id === rejectingId ? { ...app, status: 'rejected', admin_note: adminNote } : app
        ));
        setRejectingId(null);
        setAdminNote('');
      } else {
        const data = await res.json();
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-400" />
            Novel Creator Arizalari
          </h1>
          <p className="text-slate-400 text-sm mt-1">Novel yozuvchilarining oylik obuna to'lov kvitansiyalari va arizalari ro'yxati</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Foydalanuvchi</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Kvitansiya (Receipt)</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Foydalanuvchi izohi</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Ariza sanasi</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Holat</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Yuklanmoqda...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Hozircha arizalar mavjud emas.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">{app.user?.name}</div>
                      <div className="text-xs text-slate-400">{app.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedReceipt(app.receipt_url)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Kvitansiyani ko'rish
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={app.user_note}>
                      {app.user_note || <span className="text-slate-500 italic">Izoh yo'q</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(app.created_at).toLocaleDateString('uz-UZ', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : app.status === 'rejected'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {app.status === 'approved' ? 'Tasdiqlangan' : app.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                      </span>
                      {app.status === 'rejected' && app.admin_note && (
                        <div className="text-xs text-red-300/80 mt-1 max-w-xs">{app.admin_note}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-900 rounded-lg text-emerald-400 transition-colors cursor-pointer"
                            title="Tasdiqlash"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectingId(app.id)}
                            className="p-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-lg text-red-400 transition-colors cursor-pointer"
                            title="Rad etish"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* zoom receipt modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-3xl w-full p-4 relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 border border-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-slate-200">To'lov Kvitansiyasi</h3>
            <div className="overflow-auto max-h-[70vh] flex justify-center bg-slate-950 rounded-xl p-2 border border-white/5">
              <img
                src={selectedReceipt}
                alt="Receipt kvitansiya"
                className="max-w-full h-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject application modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleRejectSubmit} className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setRejectingId(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 border border-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Arizani rad etish sababi
            </h3>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rad etish sababi (Foydalanuvchiga ko'rsatiladi)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required
                rows={4}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                placeholder="Masalan: Kvitansiya summasi xato yoki rasm o'qib bo'lmaydigan darajada xira..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-xl font-bold text-sm cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-500/10 cursor-pointer"
              >
                Rad etishni tasdiqlash
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
