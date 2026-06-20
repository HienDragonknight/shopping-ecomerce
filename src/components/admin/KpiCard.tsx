import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // % change vs previous period
  icon: ReactNode;
  iconBg?: string;
  loading?: boolean;
}

export function KpiCard({ title, value, subtitle, trend, icon, iconBg = "bg-blue-500", loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          <div className="w-16 h-5 bg-slate-200 rounded-full" />
        </div>
        <div className="w-24 h-7 bg-slate-200 rounded mb-1" />
        <div className="w-32 h-4 bg-slate-100 rounded" />
      </div>
    );
  }

  const trendUp = trend !== undefined && trend > 0;
  const trendDown = trend !== undefined && trend < 0;
  const trendNeutral = trend === 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center text-white shrink-0`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            trendUp ? "bg-emerald-50 text-emerald-600" :
            trendDown ? "bg-red-50 text-red-500" :
            "bg-slate-100 text-slate-500"
          }`}>
            {trendUp && <TrendingUp size={10} />}
            {trendDown && <TrendingDown size={10} />}
            {trendNeutral && <Minus size={10} />}
            {trendUp ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-sm font-medium text-slate-500 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}
