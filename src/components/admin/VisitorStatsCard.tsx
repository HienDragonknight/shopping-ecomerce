"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Activity, RotateCw, Globe, TrendingUp, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisitorStatsProps {
  initialBaseOffset?: number;
}

export function VisitorStatsCard({ initialBaseOffset = 4270 }: VisitorStatsProps) {
  const [totalVisits, setTotalVisits] = useState<number>(initialBaseOffset);
  const [todayVisits, setTodayVisits] = useState<number>(0);
  const [isRealtime, setIsRealtime] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch statistics from API / DB
  const fetchStats = useCallback(async (showSpin = false) => {
    if (showSpin) setIsRefreshing(true);
    try {
      const res = await fetch("/api/analytics/visit", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTotalVisits(data.totalVisits);
          setTodayVisits(data.todayVisits);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.error("Error fetching visitor stats:", err);
    } finally {
      setIsLoading(false);
      if (showSpin) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!isRealtime) return;

    const channel = supabase
      .channel("public:site_visits")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "site_visits",
        },
        () => {
          setTotalVisits((prev) => prev + 1);
          setTodayVisits((prev) => prev + 1);
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    // Secondary periodic sync every 15s to keep numbers exact
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isRealtime, fetchStats]);

  // Format numbers with Vietnamese dot thousand separators e.g. 1.533
  const formatNumber = (num: number) => {
    return num.toLocaleString("vi-VN");
  };

  return (
    <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-3xl p-6 md:p-8 shadow-sm transition-all text-[#1E3A2B] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Title & Status */}
        <div className="flex items-start gap-3.5">
          <div className="bg-[#1E3A2B] text-white p-3 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-[#1E3A2B] font-extrabold text-base md:text-lg tracking-wider uppercase font-sans">
                THỐNG KÊ TRUY CẬP
              </h2>
              {isRealtime ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Realtime
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600 border border-slate-300">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Tắt Realtime
                </span>
              )}
            </div>
            <p className="font-serif italic text-2xl md:text-3xl text-[#1E3A2B] font-medium tracking-tight mt-0.5">
              Lượt truy cập
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={() => setIsRealtime((prev) => !prev)}
            className="bg-[#EAE4D5] hover:bg-[#DFD8C7] text-[#1E3A2B] text-xs font-bold tracking-wider px-4 py-2.5 rounded-full transition-all border border-[#DCD5C3] hover:shadow-xs active:scale-95 uppercase cursor-pointer"
            title={isRealtime ? "Tắt tự động cập nhật realtime" : "Bật tự động cập nhật realtime"}
          >
            {isRealtime ? "TẮT REALTIME" : "BẬT REALTIME"}
          </button>
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="bg-[#EAE4D5] hover:bg-[#DFD8C7] text-[#1E3A2B] text-xs font-bold tracking-wider px-4 py-2.5 rounded-full transition-all border border-[#DCD5C3] hover:shadow-xs active:scale-95 flex items-center gap-2 uppercase cursor-pointer disabled:opacity-60"
            title="Tải lại dữ liệu mới nhất"
          >
            <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            LÀM MỚI
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Card 1: Tổng lượt truy cập */}
        <div className="bg-white rounded-2xl p-6 border border-[#ECE6D8] shadow-xs flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-[#8B8476]">
              TỔNG LƯỢT TRUY CẬP
            </span>
            <div className="flex items-center gap-2 text-[#7C887F]">
              <span title="Chỉnh sửa chỉ số ban đầu">
                <Edit2 className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl md:text-4xl font-serif font-bold text-[#1E3A2B] tracking-tight">
              {isLoading ? "..." : formatNumber(totalVisits)}
            </p>
          </div>
        </div>

        {/* Card 2: Lượt truy cập hôm nay */}
        <div className="bg-white rounded-2xl p-6 border border-[#ECE6D8] shadow-xs flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-[#8B8476]">
              TỔNG LƯỢT TRUY CẬP HÔM NAY
            </span>
            <Globe className="w-4.5 h-4.5 text-[#1E3A2B]" />
          </div>
          <div className="mt-3">
            <p className="text-3xl md:text-4xl font-serif font-bold text-[#1E3A2B] tracking-tight">
              {isLoading ? "..." : formatNumber(todayVisits)}
            </p>
            <p className="text-sm text-[#666B64] font-sans font-normal mt-1.5">
              Tổng số lượt xem trong ngày hôm nay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
