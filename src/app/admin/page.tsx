"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { KpiCard } from "@/components/admin/KpiCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { VisitorStatsCard } from "@/components/admin/VisitorStatsCard";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, ShoppingCart, Users, Package,
  Clock, TrendingUp, AlertTriangle, ArrowRight
} from "lucide-react";

interface DashboardStats {
  totalRevenue: number;
  revenueToday: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalUsers: number;
  totalProducts: number;
}

interface RevenueMonth {
  month: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: number;
  name: string;
  thumbnailUrl: string | null;
  category: string;
  sold: number;
  revenue: number;
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

function fmtVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 text-sm">
      <p className="font-bold text-slate-800 mb-1">{label}</p>
      {payload[0] && <p className="text-blue-600">Doanh thu: <span className="font-bold">{fmtVND(payload[0].value)}</span></p>}
      {payload[1] && <p className="text-emerald-600">Đơn hàng: <span className="font-bold">{payload[1].value}</span></p>}
    </div>
  );
}

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-600",
};
const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueMonth[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, revenueRes, topProdRes, ordersRes, invRes] = await Promise.allSettled([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/dashboard/revenue"),
          api.get("/admin/dashboard/top-products", { params: { size: 5 } }),
          api.get("/admin/orders", { params: { page: 0, size: 8 } }),
          api.get("/admin/inventory", { params: { page: 0, size: 100 } }),
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
        if (revenueRes.status === "fulfilled") setRevenueData(revenueRes.value.data.data || []);
        if (topProdRes.status === "fulfilled") setTopProducts(topProdRes.value.data.data || []);
        if (ordersRes.status === "fulfilled") setRecentOrders(ordersRes.value.data.data.content || []);

        // Low stock from inventory
        if (invRes.status === "fulfilled") {
          const products: any[] = invRes.value.data.data.content || [];
          const low = products.flatMap((p: any) =>
            (p.variants || [])
              .filter((v: any) => (v.stockQty ?? 0) <= 10)
              .map((v: any) => ({
                productName: p.name,
                size: v.size,
                color: v.color,
                stockQty: v.stockQty ?? 0,
              }))
          ).slice(0, 6);
          setLowStock(low);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const parseCustomer = (snapshot: string) => {
    if (!snapshot) return "—";
    const parts = snapshot.split("—");
    if (parts.length >= 2) return parts[1].trim().split(",")[0]?.trim() || "—";
    return snapshot.substring(0, 20);
  };

  const kpiCards = [
    {
      title: "Doanh thu hôm nay",
      value: stats ? fmtVND(stats.revenueToday ?? 0) : "—",
      icon: <DollarSign size={18} />,
      iconBg: "bg-blue-500",
      subtitle: "Đơn DELIVERED",
    },
    {
      title: "Tổng doanh thu",
      value: stats ? fmt(stats.totalRevenue ?? 0) + "đ" : "—",
      icon: <TrendingUp size={18} />,
      iconBg: "bg-indigo-500",
      subtitle: "Đơn đã giao",
    },
    {
      title: "Tổng đơn hàng",
      value: stats?.totalOrders?.toLocaleString() ?? "—",
      icon: <ShoppingCart size={18} />,
      iconBg: "bg-purple-500",
      subtitle: "Tất cả thời gian",
    },
    {
      title: "Chờ xác nhận",
      value: stats?.pendingOrders?.toLocaleString() ?? "—",
      icon: <Clock size={18} />,
      iconBg: "bg-amber-500",
      subtitle: "Cần xử lý ngay",
    },
    {
      title: "Tổng khách hàng",
      value: stats?.totalUsers?.toLocaleString() ?? "—",
      icon: <Users size={18} />,
      iconBg: "bg-emerald-500",
      subtitle: "Đã đăng ký",
    },
    {
      title: "Tổng sản phẩm",
      value: stats?.totalProducts?.toLocaleString() ?? "—",
      icon: <Package size={18} />,
      iconBg: "bg-rose-500",
      subtitle: "Trong catalog",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          href="/admin/reports"
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white bg-[#1A1A1A] hover:bg-[#E5B800] px-4 py-2 rounded-xl transition-colors"
        >
          <TrendingUp size={15} />
          Xem báo cáo
        </Link>
      </div>

      {/* Realtime Visitor Statistics Card */}
      <VisitorStatsCard />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <KpiCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            iconBg={card.iconBg}
            loading={loading}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <ChartCard
          title="Doanh thu & Đơn hàng"
          subtitle={`Năm ${new Date().getFullYear()}`}
          className="xl:col-span-2"
        >
          {revenueData.length === 0 && !loading ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
              <div className="text-center">
                <p className="text-3xl mb-2">📊</p>
                <p>Chưa có dữ liệu doanh thu</p>
                <p className="text-xs mt-1">Dữ liệu sẽ xuất hiện khi có đơn hàng DELIVERED</p>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => fmt(v)} width={45} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2}
                    fill="url(#colorRevenue)" dot={false} activeDot={{ r: 4, fill: "#3b82f6" }} />
                  <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2}
                    fill="url(#colorOrders)" dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 pt-3 border-t border-slate-50">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Doanh thu
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Đơn hàng
                </span>
              </div>
            </>
          )}
        </ChartCard>

        {/* Top Products */}
        <ChartCard title="Top sản phẩm bán chạy" subtitle="Theo số lượng bán">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse mb-2" />
            ))
          ) : topProducts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p className="text-2xl mb-2">📦</p>
              <p>Chưa có dữ liệu bán hàng</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    i === 0 ? "bg-[#1A1A1A] text-white" :
                    i === 1 ? "bg-slate-200 text-slate-700" :
                    i === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-100 text-slate-500"
                  }`}>{i + 1}</span>
                  {p.thumbnailUrl && (
                    <img src={p.thumbnailUrl} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-800">{Number(p.sold).toLocaleString()} sold</p>
                    <p className="text-[10px] text-slate-400">{fmt(Number(p.revenue))}đ</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900">Đơn hàng mới nhất</h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1">
              Xem tất cả <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  {["Mã đơn", "Khách hàng", "Tổng tiền", "Trạng thái", "Ngày"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-5 py-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td></tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm">Chưa có đơn hàng</td></tr>
                ) : recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-sm font-bold text-blue-600 hover:underline">
                        #{o.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700">{parseCustomer(o.snapshotAddress)}</td>
                    <td className="px-5 py-3 text-sm font-bold text-slate-900">
                      {o.total?.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLOR[o.status] || "bg-slate-100 text-slate-500"}`}>
                        {ORDER_STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <h3 className="font-bold text-slate-900">Cảnh báo tồn kho</h3>
            </div>
            <Link href="/admin/inventory" className="text-xs font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1">
              Quản lý <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))
            ) : lowStock.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-1">✅</p>
                <p className="text-sm text-slate-500">Tồn kho ổn định</p>
                <p className="text-xs text-slate-400 mt-1">Không có sản phẩm sắp hết</p>
              </div>
            ) : lowStock.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">{item.productName}</p>
                  <p className="text-[10px] text-slate-400">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
                </div>
                <span className={`ml-2 shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                  item.stockQty === 0
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {item.stockQty} còn
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
