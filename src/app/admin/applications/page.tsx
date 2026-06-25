<<<<<<< HEAD
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FileText, Check, X, ShieldAlert } from 'lucide-react';
import { API_URL } from '@/context/AuthContext';

export default function AdminApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_URL}/admin/translator-applications`, {
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
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    if (!confirm(`Siz rostdan ham ushbu arizani ${status === 'approved' ? 'tasdiqlamoqchimisiz' : 'rad etmoqchimisiz'}?`)) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/admin/translator-applications/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        // Update local state
        setApplications(apps => apps.map(app => 
          app.id === id ? { ...app, status } : app
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-pink-400" />
            Tarjimonlik Arizalari
          </h1>
          <p className="text-slate-400 text-sm mt-1">Foydalanuvchilarning tarjimon yoki homiy bo'lish uchun yuborgan arizalari ro'yxati</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Foydalanuvchi</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Email</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Ariza sanasi</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Holat</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Yuklanmoqda...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Hozircha arizalar mavjud emas.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden">
                          {app.user?.avatar_url ? (
                            <img src={`${API_URL.replace(/\/api$/, '')}/storage/${app.user.avatar_url}`} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-700"></div>
                          )}
                        </div>
                        <span className="font-medium text-slate-200">{app.user?.name || 'Noma\'lum'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{app.user?.email}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(app.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      {app.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Kutilmoqda</span>}
                      {app.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Tasdiqlangan</span>}
                      {app.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Rad etilgan</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'approved')}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition-colors"
                            title="Tasdiqlash"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                            title="Rad etish"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
=======
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FileText, Check, X, ShieldAlert } from 'lucide-react';
import { API_URL } from '@/context/AuthContext';

export default function AdminApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_URL}/admin/translator-applications`, {
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
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    if (!confirm(`Siz rostdan ham ushbu arizani ${status === 'approved' ? 'tasdiqlamoqchimisiz' : 'rad etmoqchimisiz'}?`)) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/admin/translator-applications/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        // Update local state
        setApplications(apps => apps.map(app => 
          app.id === id ? { ...app, status } : app
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-pink-400" />
            Tarjimonlik Arizalari
          </h1>
          <p className="text-slate-400 text-sm mt-1">Foydalanuvchilarning tarjimon yoki homiy bo'lish uchun yuborgan arizalari ro'yxati</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Foydalanuvchi</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Email</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Ariza sanasi</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Holat</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Yuklanmoqda...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Hozircha arizalar mavjud emas.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden">
                          {app.user?.avatar_url ? (
                            <img src={`${API_URL.replace(/\/api$/, '')}/storage/${app.user.avatar_url}`} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-700"></div>
                          )}
                        </div>
                        <span className="font-medium text-slate-200">{app.user?.name || 'Noma\'lum'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{app.user?.email}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(app.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      {app.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Kutilmoqda</span>}
                      {app.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Tasdiqlangan</span>}
                      {app.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Rad etilgan</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'approved')}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition-colors"
                            title="Tasdiqlash"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                            title="Rad etish"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
>>>>>>> origin
