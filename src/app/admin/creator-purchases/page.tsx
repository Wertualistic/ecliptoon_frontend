'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { FileText, Check, X, ShieldAlert, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function CreatorPurchasesPage() {
  const { token } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, [token]);

  const fetchPurchases = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/creator/purchases`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPurchases(data);
      }
    } catch (err) {
      console.error('Error fetching purchases', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu to'lovni tasdiqlamoqchimisiz? Tasdiqlash foydalanuvchiga novel yoki bobni ochib beradi.")) return;

    try {
      const res = await fetch(`${API_URL}/creator/purchases/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setPurchases(items => items.map(item => 
          item.id === id ? { ...item, status: 'approved' } : item
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
      const res = await fetch(`${API_URL}/creator/purchases/${rejectingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ admin_note: adminNote })
      });
      
      if (res.ok) {
        setPurchases(items => items.map(item => 
          item.id === rejectingId ? { ...item, status: 'rejected', admin_note: adminNote } : item
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
            Xarid Arizalari va Kvitansiyalar
          </h1>
          <p className="text-slate-400 text-sm mt-1">Foydalanuvchilarning pullik bob yoki obunalar uchun yuborgan to'lov kvitansiyalarini tasdiqlash</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Foydalanuvchi</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Novel / Bob</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Xarid turi</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Kvitansiya</th>
                <th className="px-6 py-4 font-semibold text-slate-300">To'langan karta</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Summa</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Holat</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">Yuklanmoqda...</td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">Hozircha xarid arizalari mavjud emas.</td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">{p.user?.name}</div>
                      <div className="text-xs text-slate-400">{p.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{p.novel?.title || p.series?.title}</div>
                      {(p.novel_chapter || p.chapter) ? (
                        <div className="text-xs text-slate-400 font-bold">Bob {(p.novel_chapter || p.chapter).chapter_number}</div>
                      ) : (
                        <div className="text-[10px] text-violet-400 uppercase font-extrabold flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> Obuna
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                      {p.purchase_type === 'single_chapter' && '1 ta bob xaridi'}
                      {p.purchase_type === 'subscription_1m' && '1 oylik obuna'}
                      {p.purchase_type === 'subscription_3m' && '3 oylik obuna'}
                      {p.purchase_type === 'subscription_6m' && '6 oylik obuna'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedReceipt(p.receipt_url)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Kvitansiya
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                      {p.payment_method ? (
                        <div>
                          <div>{p.payment_method.bank_name}</div>
                          <div className="font-mono text-slate-400">{p.payment_method.card_number.replace(/(.{4})/g, '$1 ')}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">
                      {(p.amount ?? 0).toLocaleString()} UZS
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        p.status === 'approved'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : p.status === 'rejected'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {p.status === 'approved' ? 'Tasdiqlangan' : p.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                      </span>
                      {p.status === 'rejected' && p.admin_note && (
                        <div className="text-xs text-red-300/80 mt-1 max-w-xs">{p.admin_note}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-900 rounded-lg text-emerald-400 transition-colors cursor-pointer"
                            title="Tasdiqlash"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectingId(p.id)}
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
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

      {/* Reject modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
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
              Rad etish sababi
            </h3>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sabab (Foydalanuvchiga ko'rsatiladi)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required
                rows={4}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                placeholder="To'lov tasdiqlanmagani yoki summasi kamligi haqida izoh yozing..."
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
                Rad etish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
