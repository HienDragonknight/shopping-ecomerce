"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { ChartCard } from "@/components/admin/ChartCard";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, ShoppingBag, Package, RefreshCw } from "lucide-react";

function fmt(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#94a3b8", "#ef4444", "#14b8a6"];

// ── Revenue Tab ───────────────────────────────────────────────────────────────
function RevenueTab({ year }: { year: number }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/reports/revenue", { params: { year } })
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-slate-100" />
      ))}
    </div>
  );

  const monthly = data?.monthly || [];
  const hasData = monthly.some((m: any) => Number(m.revenue) > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng doanh thu", value: fmt(Number(data?.totalRevenue || 0)) + "đ", icon: "💰", color: "bg-blue-500" },
          { label: "Lợi nhuận ước tính (30%)", value: fmt(Number(data?.totalProfit || 0)) + "đ", icon: "📈", color: "bg-emerald-500" },
          { label: "Tổng đơn hàng", value: Number(data?.totalOrders || 0).toLocaleString(), icon: "📦", color: "bg-purple-500" },
          { label: "Giá trị TB/đơn", value: fmt(Number(data?.avgOrderValue || 0)) + "đ", icon: "🧾", color: "bg-amber-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <ChartCard title={`Doanh thu & Lợi nhuận năm ${year}`} subtitle="Chỉ tính đơn hàng DELIVERED">
        {!hasData ? (
          <div className="h-56 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-3xl mb-2">📊</p>
              <p className="font-medium">Chưa có dữ liệu doanh thu</p>
              <p className="text-xs mt-1">Dữ liệu sẽ xuất hiện khi có đơn hàng DELIVERED</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(Number(v))} width={48} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip formatter={(v: any) => [Number(v).toLocaleString("vi-VN") + "đ"]} />
              <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={2} fill="url(#gRev)" dot={false} />
              <Area type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#10b981" strokeWidth={2} fill="url(#gProfit)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Số đơn hàng theo tháng">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip formatter={(v: any) => [v, "Đơn hàng"]} />
            <Bar dataKey="orders" name="Đơn hàng" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ── Sales Tab ─────────────────────────────────────────────────────────────────
function SalesTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/reports/sales")
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-slate-100" />)}
    </div>
  );

  const topProducts: any[] = data?.topProducts || [];
  const categories: any[] = data?.categories || [];
  const hasCategories = categories.length > 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Doanh số theo danh mục" subtitle="% tổng doanh thu">
          {!hasCategories ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm text-center">
              <div><p className="text-3xl mb-2">📊</p><p>Chưa có dữ liệu bán hàng</p></div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={categories} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    dataKey="percentage" paddingAngle={3}>
                    {categories.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(v: any) => [`${v}%`, "Tỉ lệ"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {categories.slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs text-slate-600 truncate max-w-[80px]">{c.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Top sản phẩm bán chạy" subtitle="Theo doanh số thực tế">
          {topProducts.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm text-center">
              <div><p className="text-3xl mb-2">📦</p><p>Chưa có dữ liệu</p></div>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    i === 0 ? "bg-[#FCCE00] text-[#1A1A1A]" : i === 1 ? "bg-slate-200 text-slate-700" :
                    i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                  }`}>{i + 1}</span>
                  {p.thumbnailUrl && <img src={p.thumbnailUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${topProducts[0] ? Math.min(100, (Number(p.sold) / Number(topProducts[0].sold)) * 100) : 0}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">{Number(p.sold).toLocaleString()} sold</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-800">{fmt(Number(p.revenue))}đ</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// ── Customer Tab ──────────────────────────────────────────────────────────────
function CustomerTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/reports/customers")
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-slate-100" />)}
    </div>
  );

  const topCustomers: any[] = data?.topCustomers || [];
  const totalCustomers = data?.totalCustomers || 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-3">
            <Users size={18} />
          </div>
          <p className="text-2xl font-black text-slate-900">{Number(totalCustomers).toLocaleString()}</p>
          <p className="text-xs text-slate-500">Tổng khách hàng</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-3">
            <TrendingUp size={18} />
          </div>
          <p className="text-2xl font-black text-slate-900">{topCustomers.length}</p>
          <p className="text-xs text-slate-500">Khách chi tiêu cao nhất</p>
        </div>
      </div>

      <ChartCard title="Top khách hàng chi tiêu nhiều nhất" subtitle="Tất cả thời gian">
        {topCustomers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-3xl mb-2">👥</p>
            <p>Chưa có dữ liệu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["#", "Khách hàng", "Email", "Đơn hàng", "Tổng chi"].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-bold text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topCustomers.map((c: any, i: number) => (
                  <tr key={c.id}>
                    <td className="py-3 text-sm font-bold text-slate-400">#{i + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {String(c.fullName || "?")[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-slate-500">{c.email}</td>
                    <td className="py-3 text-sm font-bold text-slate-700">{Number(c.orders).toLocaleString()}</td>
                    <td className="py-3 text-sm font-bold text-blue-600">
                      {Number(c.totalSpent).toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

// ── Inventory Tab ─────────────────────────────────────────────────────────────
function InventoryTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/reports/inventory")
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-slate-100" />)}
    </div>
  );

  const categories: any[] = data?.categories || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng SKU", value: Number(data?.totalSku || 0).toLocaleString(), color: "bg-blue-500", icon: <Package size={18} /> },
          { label: "Tổng đơn vị", value: Number(data?.totalUnits || 0).toLocaleString(), color: "bg-indigo-500", icon: <Package size={18} /> },
          { label: "Sắp hết hàng", value: Number(data?.lowStock || 0).toLocaleString(), color: "bg-amber-500", icon: <Package size={18} /> },
          { label: "Hết hàng", value: Number(data?.outOfStock || 0).toLocaleString(), color: "bg-red-500", icon: <Package size={18} /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white mb-3`}>{s.icon}</div>
            <p className="text-xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <ChartCard title="Tồn kho theo danh mục" subtitle="SKU theo trạng thái">
          <ResponsiveContainer width="100%" height={Math.max(200, categories.length * 50)}>
            <BarChart data={categories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip formatter={(v: any) => [v, ""]} />
              <Bar dataKey="total" name="Tổng kho" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={20} />
              <Bar dataKey="low" name="Sắp hết" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={20} />
              <Bar dataKey="outOfStock" name="Hết hàng" fill="#ef4444" radius={[0, 6, 6, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 pt-3 border-t border-slate-50 flex-wrap">
            {[["bg-blue-500", "Tổng kho"], ["bg-amber-500", "Sắp hết"], ["bg-red-500", "Hết hàng"]].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2.5 h-2.5 ${color} rounded-full`} /> {label}
              </span>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "revenue", label: "Doanh thu", icon: <TrendingUp size={14} /> },
  { id: "sales", label: "Bán hàng", icon: <ShoppingBag size={14} /> },
  { id: "customers", label: "Khách hàng", icon: <Users size={14} /> },
  { id: "inventory", label: "Tồn kho", icon: <Package size={14} /> },
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Báo cáo & Analytics</h1>
          <p className="text-sm text-slate-400">Dữ liệu thực tế từ hệ thống</p>
        </div>
        {activeTab === "revenue" && (
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="h-9 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none text-slate-600">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>Năm {y}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "revenue" && <RevenueTab year={year} />}
      {activeTab === "sales" && <SalesTab />}
      {activeTab === "customers" && <CustomerTab />}
      {activeTab === "inventory" && <InventoryTab />}
    </div>
  );
}
