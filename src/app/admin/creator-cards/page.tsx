'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { Coins, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

interface Card {
  id: number;
  card_number: string;
  card_holder_name: string;
  bank_name: string;
  is_active: boolean;
}

export default function CreatorCardsPage() {
  const { token } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCards();
  }, [token]);

  const fetchCards = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/creator/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setCards(await res.json());
      }
    } catch (err) {
      console.error(err);
      setError('Kartalarni yuklashda xatolik.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCard(null);
    setCardNumber('');
    setCardHolder('');
    setBankName('');
    setIsActive(true);
    setShowForm(true);
  };

  const handleOpenEdit = (card: Card) => {
    setEditingCard(card);
    setCardNumber(card.card_number);
    setCardHolder(card.card_holder_name);
    setBankName(card.bank_name);
    setIsActive(card.is_active);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCardNumber = cardNumber.replace(/\D/g, '');
    if (cleanCardNumber.length < 15 || cleanCardNumber.length > 19) {
      alert("Karta raqami noto'g'ri kiritildi.");
      return;
    }

    const payload = {
      card_number: cleanCardNumber,
      card_holder_name: cardHolder,
      bank_name: bankName,
      is_active: isActive
    };

    const url = editingCard 
      ? `${API_URL}/creator/payment-methods/${editingCard.id}`
      : `${API_URL}/creator/payment-methods`;
    
    const method = editingCard ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowForm(false);
        fetchCards();
      } else {
        const data = await res.json();
        alert(data.message || "Saqlashda xatolik.");
      }
    } catch (err) {
      alert("Tarmoq xatosi.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu kartani o'chirmoqchimisiz?")) return;

    try {
      const res = await fetch(`${API_URL}/creator/payment-methods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setCards(items => items.filter(item => item.id !== id));
      } else {
        alert("O'chirishda xatolik.");
      }
    } catch (err) {
      alert("Tarmoq xatosi.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-violet-400" />
            Kredit Kartalari (Payment Cards)
          </h1>
          <p className="text-slate-400 text-sm mt-1">Foydalanuvchilar to'lovlarni o'tkazishi uchun o'zingizning bank kartalaringizni boshqarish</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-violet-500/10 transition-colors"
        >
          <Plus className="w-4.5 h-4.5" />
          Karta Qo'shish
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="text-slate-400 text-center py-12">Yuklanmoqda...</p>
      ) : cards.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl border border-white/5 text-center text-slate-400 py-12 max-w-md mx-auto">
          Hali bank kartalarini qo'shmagansiz. Foydalanuvchilar sizning novellalaringiz yoki obunalaringizni sotib olishlari uchun kamida bitta faol karta qo'shishingiz shart.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.id} className="glass-card p-6 border border-white/5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/20 flex flex-col justify-between h-48 relative shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-violet-400 font-bold uppercase tracking-wider">{card.bank_name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                    Holati: <span className={card.is_active ? 'text-emerald-400' : 'text-red-400'}>{card.is_active ? 'Faol' : 'Nofaol'}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(card)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xl font-bold tracking-widest text-slate-200 font-mono my-4">
                {card.card_number ? String(card.card_number).replace(/(.{4})/g, '$1 ').trim() : '---- ---- ---- ----'}
              </div>

              <div className="flex justify-between items-end text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Karta Egasi</div>
                  <div className="font-bold text-slate-300 uppercase">{card.card_holder_name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 border border-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-lg text-slate-100 border-b border-white/5 pb-2">
              {editingCard ? 'Kartani tahrirlash' : 'Yangi karta qo\'shish'}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Karta raqami (16 xonali)</label>
              <input
                type="text"
                required
                maxLength={16}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors font-mono"
                placeholder="8600000000000000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Karta egasi ismi-familiyasi</label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors uppercase"
                placeholder="ESHMURADOV ESHMAT"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bank nomi va karta turi</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                placeholder="TBC Bank (Humo) yoki Agrobank (Uzcard)"
              />
            </div>

            {editingCard && (
              <div className="space-y-1.5 flex items-center pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-950 border-white/10"
                  />
                  <span>Faol karta (Foydalanuvchilarga ko'rsatilsin)</span>
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-xl font-bold text-sm cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm shadow-md shadow-violet-500/10 cursor-pointer"
              >
                Saqlash
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
