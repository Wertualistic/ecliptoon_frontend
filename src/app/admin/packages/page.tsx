'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { Coins, CreditCard, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { StrawberryIcon } from '@/components/StrawberryIcon';

interface Package {
  id: number;
  name: string;
  diamond_amount: number;
  price: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
}

interface PaymentCard {
  id: number;
  card_number: string;
  card_holder_name: string;
  bank_name: string;
  is_active: boolean;
}

export default function AdminPackagesPage() {
  const { token } = useAuth();
  const { t } = useTranslation();

  const [packages, setPackages] = useState<Package[]>([]);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [pkgName, setPkgName] = useState<string>('');
  const [pkgAmount, setPkgAmount] = useState<string>('');
  const [pkgPrice, setPkgPrice] = useState<string>('');
  const [pkgSort, setPkgSort] = useState<string>('0');

  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardBank, setCardBank] = useState<string>('');

  const [creatorFee, setCreatorFee] = useState<string>('50000');
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
        setCards(data.payment_methods || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCreatorFee(String(data.novel_creator_monthly_fee));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
      fetchSettings();
    }
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          novel_creator_monthly_fee: parseInt(creatorFee),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatorFee(String(data.novel_creator_monthly_fee));
        alert('Creator obuna narxi muvaffaqiyatli o\'zgartirildi.');
      } else {
        const data = await res.json();
        setError(data.message || 'Sozlamalarni saqlashda xatolik.');
      }
    } catch (err) {
      setError('Tarmoq xatosi.');
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName || !pkgAmount || !pkgPrice) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/packages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: pkgName,
          diamond_amount: parseInt(pkgAmount),
          price: parseFloat(pkgPrice),
          is_active: true,
          sort_order: parseInt(pkgSort),
        }),
      });

      if (res.ok) {
        setPkgName('');
        setPkgAmount('');
        setPkgPrice('');
        setPkgSort('0');
        loadData();
      } else {
        const data = await res.json();
        setError(data.message || 'Paket qo\'shishda xatolik.');
      }
    } catch (err) {
      setError('Internet aloqasini tekshiring.');
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm('Ushbu paketni o\'chirishni xohlaysizmi?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !cardBank) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          card_number: cardNumber,
          card_holder_name: cardHolder,
          bank_name: cardBank,
          is_active: true,
        }),
      });

      if (res.ok) {
        setCardNumber('');
        setCardHolder('');
        setCardBank('');
        loadData();
      } else {
        const data = await res.json();
        setError(data.message || 'Karta qo\'shishda xatolik.');
      }
    } catch (err) {
      setError('Internet aloqasini tekshiring.');
    }
  };

  const handleDeleteCard = async (id: number) => {
    if (!confirm('Ushbu kartani o\'chirishni xohlaysizmi?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/payment-methods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5"></div>
          <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Coins className="w-6.5 h-6.5 text-red-400" />
          <span>Paketlar va kartalar (Packages & Cards)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Olmos paketlarini hamda manual bank o'tkazmasi uchun kartalarni sozlash
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl max-w-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* 1. Diamond Packages CRUD */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <Coins className="w-4.5 h-4.5 text-violet-400" />
              <span>{t('adminPanel.packagesManagement')}</span>
            </h3>

            {/* List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-3 bg-slate-950/70 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200">{pkg.name}</span>
                    <span className="text-slate-400 ml-2">({pkg.diamond_amount} <StrawberryIcon /> - {pkg.price.toLocaleString()} UZS)</span>
                  </div>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Form */}
            <form onSubmit={handleAddPackage} className="space-y-3 pt-2 border-t border-white/5">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Paket nomi (masalan: 100 Olmos)"
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Olmos miqdori"
                  value={pkgAmount}
                  onChange={(e) => setPkgAmount(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Narxi (UZS)"
                  value={pkgPrice}
                  onChange={(e) => setPkgPrice(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Tartib raqami"
                  value={pkgSort}
                  onChange={(e) => setPkgSort(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('adminPanel.addPackage')}</span>
              </button>
            </form>
          </div>
        </div>

        {/* 2. Payment methods CRUD */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <CreditCard className="w-4.5 h-4.5 text-violet-400" />
              <span>{t('adminPanel.paymentMethodsManagement')}</span>
            </h3>

            {/* List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cards.map((card) => (
                <div key={card.id} className="p-3 bg-slate-950/70 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200 font-mono">{card.card_number.replace(/(.{4})/g, '$1 ')}</span>
                    <span className="text-slate-400 ml-2">({card.bank_name} - {card.card_holder_name})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Form */}
            <form onSubmit={handleAddCard} className="space-y-3 pt-2 border-t border-white/5">
              <input
                type="text"
                placeholder="Karta raqami (8600...)"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Karta egasi (FULL NAME)"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Bank nomi (e.g. Humo Anorbank)"
                  value={cardBank}
                  onChange={(e) => setCardBank(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('adminPanel.addPaymentMethod')}</span>
              </button>
            </form>
          </div>

          {/* CREATOR SOZLAMALARI (Creator settings) */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 bg-slate-900/40">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <Coins className="w-5 h-5 text-amber-400" />
              Creator Sozlamalari
            </h3>
            
            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Creator bo'lish oylik obuna narxi (UZS)</label>
                <input
                  type="number"
                  value={creatorFee}
                  onChange={(e) => setCreatorFee(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-violet-500 transition-colors"
                  placeholder="Masalan: 50000"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Sozlamalarni saqlash
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

