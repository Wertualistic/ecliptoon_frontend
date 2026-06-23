'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Check, X, Clock, HelpCircle, Eye, ShoppingBag } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface OrderItem {
  id: number;
  title: string;
  cover_url: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'pending' | 'completed' | 'cancelled') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        // Update local state
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(prev => prev ? { ...prev, status } : null);
        }
      } else {
        const data = await res.json();
        alert(data.message || 'Xatolik yuz berdi.');
      }
    } catch (err) {
      alert('Tizim xatosi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400">
            <Check className="w-3 h-3" />
            Yetkazildi
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-400">
            <X className="w-3 h-3" />
            Bekor qilindi
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400">
            <Clock className="w-3 h-3" />
            Kutilmoqda
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Kitob buyurtmalari</h1>
        <p className="text-slate-400 text-xs mt-1">Sotib olingan kitob buyurtmalari ro'yxati va holatini nazorat qilish</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-xs">{t('common.loading')}</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-bold bg-slate-950/20 uppercase tracking-wider">
                      <th className="py-4 px-6 w-16">ID</th>
                      <th className="py-4 px-6">Xaridor</th>
                      <th className="py-4 px-6">Jami narx</th>
                      <th className="py-4 px-6 w-28">Holati</th>
                      <th className="py-4 px-6 w-24">Sana</th>
                      <th className="py-4 px-6 w-16 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`hover:bg-slate-900/20 transition-colors font-medium cursor-pointer ${selectedOrder?.id === order.id ? 'bg-slate-900/20 border-l-2 border-violet-500' : 'text-slate-300'}`}
                      >
                        <td className="py-4 px-6 font-bold text-slate-200">#{order.id}</td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-200">{order.user ? order.user.name : 'Noma\'lum xaridor'}</div>
                            <div className="text-[10px] text-slate-500">{order.user ? order.user.email : '-'}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-amber-400 font-extrabold">{order.total_price} <StrawberryIcon /></td>
                        <td className="py-4 px-6">{getStatusBadge(order.status)}</td>
                        <td className="py-4 px-6 text-slate-500">
                          {new Date(order.created_at).toLocaleDateString('uz-UZ', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs border border-white/5 bg-slate-900/10 rounded-2xl">
              Hozircha hech qanday buyurtmalar mavjud emas.
            </div>
          )}
        </div>

        {/* Details Card */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="p-6 glass-card border border-white/5 rounded-2xl space-y-6 sticky top-24">
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-200">Buyurtma #{selectedOrder.id} tafsilotlari</h3>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Sana: {new Date(selectedOrder.created_at).toLocaleString('uz-UZ')}
                  </span>
                </div>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* User details */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-slate-500 uppercase font-semibold">Mijoz haqida</h4>
                {selectedOrder.user ? (
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-xs font-semibold text-slate-300 space-y-1">
                    <div>Ism: <span className="text-slate-200 font-bold">{selectedOrder.user.name}</span></div>
                    <div>Email: <span className="text-slate-200">{selectedOrder.user.email}</span></div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Mijoz ma'lumotlari o'chirilgan.</p>
                )}
              </div>

              {/* Items details */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-slate-500 uppercase font-semibold">Sotib olingan kitoblar</h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center bg-slate-950/40 p-2 border border-white/5 rounded-xl">
                      <div className="w-8 h-11 bg-slate-900 rounded overflow-hidden flex-shrink-0 border border-white/5">
                        {item.cover_url ? (
                          <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-700">
                            <ShoppingBag className="w-4 h-4 opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-[11px] font-semibold">
                        <div className="text-slate-200 truncate">{item.title}</div>
                        <div className="text-slate-500 mt-0.5">{item.quantity} x {item.price} <StrawberryIcon /></div>
                      </div>
                      <div className="text-amber-400 font-bold text-[11px]">{item.price * item.quantity} <StrawberryIcon /></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="flex justify-between items-center text-xs font-bold bg-slate-950/40 border border-white/5 p-3.5 rounded-xl">
                <span className="text-slate-400">Jami to'lov:</span>
                <span className="text-amber-400 text-sm font-extrabold">{selectedOrder.total_price} <StrawberryIcon /></span>
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <h4 className="text-[10px] text-slate-500 uppercase font-semibold">Holatini yangilash</h4>
                
                {updatingId === selectedOrder.id ? (
                  <div className="text-center py-2 text-slate-500 text-xs">Yangilanmoqda...</div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                      disabled={selectedOrder.status === 'completed'}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-white/5 border border-emerald-500/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      Yetkazildi
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                      disabled={selectedOrder.status === 'cancelled'}
                      className="flex-1 py-2.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-white/5 text-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      Bekor qilish
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs border border-white/5 bg-slate-900/10 rounded-2xl sticky top-24">
              Tafsilotlarini ko'rish uchun chap tomondan buyurtmani tanlang.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
