'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { ImageZoomModal } from '@/components/ImageZoomModal';
import { Landmark, Calendar, Clock, Check, X, ShieldAlert, Eye, MessageSquare, AlertCircle } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface TopupRequest {
  id: number;
  user_name: string;
  user_email: string;
  package_name: string;
  diamond_amount: number;
  amount: number;
  receipt_url: string;
  user_note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export default function AdminTopupRequestsPage() {
  const { token } = useAuth();
  const { t } = useTranslation();

  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [selectedReq, setSelectedReq] = useState<TopupRequest | null>(null);

  // Modal & Action states
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = filterStatus 
        ? `${API_URL}/admin/topup-requests?status=${filterStatus}`
        : `${API_URL}/admin/topup-requests`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadRequests();
    }
  }, [token, filterStatus]);

  const handleRowClick = (req: TopupRequest) => {
    setSelectedReq(req);
    setIsZoomOpen(true);
    setShowRejectDialog(false);
    setRejectReason('');
    setActionError(null);
  };

  const handleApprove = async () => {
    if (!selectedReq || !token) return;
    setSubmittingAction(true);
    setActionError(null);
    try {
      const res = await fetch(`${API_URL}/admin/topup-requests/${selectedReq.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsZoomOpen(false);
        setSelectedReq(null);
        loadRequests();
      } else {
        setActionError(data.message || 'Tasdiqlashda xatolik yuz berdi.');
      }
    } catch (err) {
      setActionError('Internet aloqasini tekshiring.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !token || !rejectReason.trim()) return;
    setSubmittingAction(true);
    setActionError(null);
    try {
      const res = await fetch(`${API_URL}/admin/topup-requests/${selectedReq.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_note: rejectReason }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setIsZoomOpen(false);
        setSelectedReq(null);
        loadRequests();
      } else {
        setActionError(data.message || 'Rad etishda xatolik yuz berdi.');
      }
    } catch (err) {
      setActionError('Internet aloqasini tekshiring.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/25';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('dashboard.statusPending');
      case 'approved': return t('dashboard.statusApproved');
      case 'rejected': return t('dashboard.statusRejected');
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Landmark className="w-6.5 h-6.5 text-red-400" />
            <span>To'lov arizalari (Topup requests)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Foydalanuvchilar tomonidan yuborilgan to'lov kvitansiyalarini tasdiqlash yoki rad etish
          </p>
        </div>

        {/* Status Filter tabs */}
        <div className="flex bg-slate-900 border border-white/5 rounded-xl p-1 text-xs">
          {['pending', 'approved', 'rejected', ''].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status === 'pending' && t('dashboard.statusPending')}
              {status === 'approved' && t('dashboard.statusApproved')}
              {status === 'rejected' && t('dashboard.statusRejected')}
              {status === '' && t('common.all')}
            </button>
          ))}
        </div>
      </div>

      {/* Requests table logs */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-900/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Foydalanuvchi</th>
                  <th className="pb-3 px-4">Paket</th>
                  <th className="pb-3 px-4">To'lov miqdori</th>
                  <th className="pb-3 px-4">Sana</th>
                  <th className="pb-3 px-4">Holati</th>
                  <th className="pb-3 px-4 text-center">Amal</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr 
                    key={req.id} 
                    className="border-b border-white/5 text-slate-300 hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200 block">{req.user_name}</span>
                        <span className="text-[10px] text-slate-500 font-medium block">{req.user_email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200">{req.package_name}</span>
                        <span className="text-[10px] text-amber-400 block font-semibold">+{req.diamond_amount} <StrawberryIcon /></span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-200 font-bold">
                      {req.amount.toLocaleString()} UZS
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(req.created_at).toLocaleDateString('uz-UZ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${getStatusBadge(req.status)}`}>
                        {getStatusText(req.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleRowClick(req)}
                        className="inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ko'rish</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">
            Ushbu holat bo'yicha to'lov arizalari mavjud emas.
          </div>
        )}
      </div>

      {/* Review details zoom modal */}
      {selectedReq && (
        <ImageZoomModal
          isOpen={isZoomOpen}
          imageUrl={selectedReq.receipt_url}
          onClose={() => {
            if (!submittingAction) {
              setIsZoomOpen(false);
            }
          }}
        />
      )}

      {/* Inline Review Action Panel inside page */}
      {selectedReq && (
        <div className="glass-card p-6 rounded-2xl border border-red-500/20 bg-red-500/5 mt-6 space-y-6">
          <div className="flex justify-between items-start border-b border-red-500/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>Tanlangan arizani ko'rib chiqish</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Foydalanuvchi: <span className="font-bold text-slate-200">{selectedReq.user_name}</span> ({selectedReq.user_email})
              </p>
            </div>
            
            <button
              onClick={() => setSelectedReq(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Yopish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Details */}
            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Paket:</span>
                <span className="col-span-2 font-bold text-slate-200">{selectedReq.package_name} (+{selectedReq.diamond_amount} <StrawberryIcon />)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">To'lov miqdori:</span>
                <span className="col-span-2 font-bold text-emerald-400">{selectedReq.amount.toLocaleString()} UZS</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-slate-500">Kvitansiya:</span>
                <div className="col-span-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsZoomOpen(true)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-200 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-violet-400" />
                    <span>Rasmni ko'rish</span>
                  </button>
                </div>
              </div>
              
              {selectedReq.user_note && (
                <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Foydalanuvchi izohi:</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">{selectedReq.user_note}</p>
                </div>
              )}

              {/* Status information */}
              {selectedReq.status !== 'pending' && (
                <div className="p-4 bg-slate-950/70 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Holat:</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getStatusBadge(selectedReq.status)}`}>
                      {getStatusText(selectedReq.status)}
                    </span>
                  </div>
                  {selectedReq.reviewed_by && (
                    <div className="text-[10px] text-slate-500">
                      Tekshirdi: <span className="font-semibold text-slate-400">{selectedReq.reviewed_by}</span>
                    </div>
                  )}
                  {selectedReq.admin_note && (
                    <div className="text-[10px] text-red-300 bg-red-500/5 p-2 rounded-lg">
                      <span className="font-bold">Rad etish sababi:</span> {selectedReq.admin_note}
                    </div>
                  )}
                </div>
              )}

              {actionError && (
                <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            {/* Right Column: Actions */}
            {selectedReq.status !== 'approved' && (
              <div className="space-y-4">
                {showRejectDialog ? (
                  /* Rejection dialog */
                  <form onSubmit={handleReject} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        {t('adminPanel.rejectReasonPrompt')}
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Rad etilish sababini yozing (masalan: Kvitansiya rasmi xira / hisobga pul tushmagan)..."
                        rows={3}
                        className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                        required
                      ></textarea>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRejectDialog(false)}
                        className="flex-1 py-2 bg-slate-900 border border-white/5 text-slate-300 text-xs rounded-xl font-bold hover:text-white cursor-pointer"
                      >
                        {t('common.cancel')}
                      </button>
                      
                      <button
                        type="submit"
                        disabled={submittingAction}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs rounded-xl font-bold cursor-pointer"
                      >
                        {submittingAction ? t('common.loading') : t('adminPanel.rejectBtn')}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Default review buttons */
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => setShowRejectDialog(true)}
                      className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 text-red-400 hover:text-red-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4 text-red-500" />
                      <span>{t('adminPanel.rejectBtn')}</span>
                    </button>

                    <button
                      onClick={handleApprove}
                      disabled={submittingAction}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer"
                    >
                      {submittingAction ? (
                        <span>{t('common.loading')}</span>
                      ) : (
                        <>
                          <Check className="w-4.5 h-4.5" />
                          <span>{t('adminPanel.approveBtn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

