"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, ShoppingBag, DollarSign, Star, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
}

interface Order {
  id: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  snapshotAddress: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [custRes, ordersRes] = await Promise.allSettled([
          api.get(`/admin/customers/${customerId}`),
          api.get("/admin/orders", { params: { userId: customerId, size: 20 } }),
        ]);
        if (custRes.status === "fulfilled") setCustomer(custRes.value.data.data);
        if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.data.data.content || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customerId]);

  const totalSpent = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const avgOrder = orders.length ? totalSpent / orders.length : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-200 rounded-2xl h-64 animate-pulse" />
          <div className="lg:col-span-2 bg-slate-200 rounded-2xl h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-2">👤</p>
        <p className="text-slate-500">Không tìm thấy khách hàng</p>
        <Link href="/admin/customers" className="mt-4 inline-block text-blue-500 hover:underline text-sm">← Quay lại</Link>
      </div>
    );
  }

  const initials = customer.fullName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const memberDays = Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / 86400000);

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={15} /> Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black mb-4">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{customer.fullName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{customer.email}</p>
          {customer.phone && <p className="text-sm text-slate-400">{customer.phone}</p>}
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
              {customer.role === "ROLE_ADMIN" ? "Admin" : "Khách hàng"}
            </span>
          </div>

          <div className="w-full mt-5 pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={13} /> Tham gia</span>
              <span className="font-semibold text-slate-800">
                {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Số ngày</span>
              <span className="font-semibold text-slate-800">{memberDays} ngày</span>
            </div>
          </div>
        </div>

        {/* Stats + Orders */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Đơn hàng", value: orders.length, icon: <ShoppingBag size={16} />, color: "bg-purple-500" },
              { label: "Tổng chi tiêu", value: totalSpent.toLocaleString("vi-VN") + "đ", icon: <DollarSign size={16} />, color: "bg-blue-500" },
              { label: "Giá trị TB", value: avgOrder > 0 ? avgOrder.toLocaleString("vi-VN") + "đ" : "—", icon: <Star size={16} />, color: "bg-amber-500" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className={`w-8 h-8 ${s.color} rounded-xl flex items-center justify-center text-white mb-2`}>{s.icon}</div>
                <p className="text-base font-black text-slate-900 break-all">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <h3 className="font-bold text-slate-900">Lịch sử đơn hàng</h3>
            </div>
            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50">
                      {["Mã đơn", "Tổng tiền", "Trạng thái", "Thanh toán", "Ngày"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${o.id}`} className="font-mono text-sm font-bold text-blue-600 hover:underline">
                            #{o.id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">
                          {o.total?.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge type="order" value={o.status} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge type="payment" value={o.paymentStatus || "UNPAID"} />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
