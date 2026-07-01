"use client";

import { useState, useEffect } from "react";
import { AccountSidebar } from "@/components/AccountSidebar";
import { GHNAddressForm, type AddressFormData } from "@/components/GHNAddressForm";
import api from "@/lib/api";

interface Address {
  id: number; fullName: string; phone: string; detail: string;
  ward: string; district: string; province: string; isDefault: boolean;
}

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleSave = async (data: AddressFormData) => {
    setSaving(true);
    try {
      await api.post("/addresses", data);
      setShowForm(false);
      fetchAddresses();
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    await api.put(`/addresses/${id}/default`);
    fetchAddresses();
  };

  const deleteAddress = async (id: number) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    await api.delete(`/addresses/${id}`);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8">
      <div className="yody-container max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 shrink-0"><AccountSidebar /></div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-[#1A1A1A]">Sổ địa chỉ</h1>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="px-4 py-2 bg-[#1A1A1A] text-white font-bold rounded-full text-sm hover:bg-[#E5B800] transition-colors"
                >
                  + Thêm địa chỉ
                </button>
              </div>

              {showForm && (
                <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                  <h2 className="font-bold text-sm text-[#1A1A1A] mb-4">Địa chỉ mới</h2>
                  <GHNAddressForm
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                    saving={saving}
                  />
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
                </div>
              ) : addresses.length === 0 && !showForm ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-4xl mb-3">📍</p>
                  <p className="font-semibold">Bạn chưa có địa chỉ nào</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 px-5 py-2 bg-[#1A1A1A] text-white font-bold rounded-full text-sm"
                  >
                    Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 border rounded-2xl transition-all ${addr.isDefault ? "border-[#1A1A1A] bg-[#FFFDE7]" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-[#1A1A1A]">{addr.fullName}</p>
                            {addr.isDefault && (
                              <span className="text-xs bg-[#1A1A1A] text-white px-2 py-0.5 rounded-full font-bold">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">📞 {addr.phone}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            📍 {addr.detail}, {addr.ward}, {addr.district}, {addr.province}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefault(addr.id)}
                              className="text-xs text-[#1A1A1A] hover:text-[#1A1A1A] font-semibold underline underline-offset-2"
                            >
                              Đặt mặc định
                            </button>
                          )}
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-semibold"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
