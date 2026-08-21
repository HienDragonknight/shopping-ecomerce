"use client";

import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";
import { MapPin, Phone, Clock, Navigation, Search } from "lucide-react";
import { useState } from "react";

interface Store {
  id: number;
  name: string;
  nameEn: string;
  city: string;
  district: string;
  address: string;
  addressEn: string;
  phone: string;
  hours: string;
  hoursEn: string;
  isFlagship?: boolean;
  mapUrl: string;
}

const storesData: Store[] = [
  {
    id: 1,
    name: "VIE'CO Flagship Store - TP. Hồ Chí Minh",
    nameEn: "VIE'CO Flagship Store - HCMC",
    city: "Hồ Chí Minh",
    district: "Quận 1",
    address: "Số 68 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    addressEn: "68 Le Loi Street, Ben Nghe Ward, District 1, Ho Chi Minh City",
    phone: "0325994197",
    hours: "08:30 - 22:00 (Hàng ngày)",
    hoursEn: "08:30 - 22:00 (Daily)",
    isFlagship: true,
    mapUrl: "https://maps.google.com/?q=68+Le+Loi+Quan+1+Ho+Chi+Minh",
  },
  {
    id: 2,
    name: "VIE'CO Concept Store - Hà Nội",
    nameEn: "VIE'CO Concept Store - Hanoi",
    city: "Hà Nội",
    district: "Hoàn Kiếm",
    address: "Số 22 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
    addressEn: "22 Trang Tien Street, Hoan Kiem District, Hanoi",
    phone: "0325994197",
    hours: "09:00 - 22:00 (Hàng ngày)",
    hoursEn: "09:00 - 22:00 (Daily)",
    isFlagship: true,
    mapUrl: "https://maps.google.com/?q=22+Trang+Tien+Hoan+Kiem+Ha+Noi",
  },
  {
    id: 3,
    name: "VIE'CO Boutique - Đà Nẵng",
    nameEn: "VIE'CO Boutique - Da Nang",
    city: "Đà Nẵng",
    district: "Hải Châu",
    address: "Số 154 Bạch Đằng, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng",
    addressEn: "154 Bach Dang Street, Hai Chau 1 Ward, Hai Chau District, Da Nang",
    phone: "0325994197",
    hours: "08:30 - 21:30 (Hàng ngày)",
    hoursEn: "08:30 - 21:30 (Daily)",
    mapUrl: "https://maps.google.com/?q=154+Bach+Dang+Da+Nang",
  },
  {
    id: 4,
    name: "VIE'CO Boutique - Cần Thơ",
    nameEn: "VIE'CO Boutique - Can Tho",
    city: "Cần Thơ",
    district: "Ninh Kiều",
    address: "Số 85 Đại Lộ Hòa Bình, Phường Tân An, Quận Ninh Kiều, Cần Thơ",
    addressEn: "85 Hoa Binh Boulevard, Tan An Ward, Ninh Kieu District, Can Tho",
    phone: "0325994197",
    hours: "08:30 - 21:30 (Hàng ngày)",
    hoursEn: "08:30 - 21:30 (Daily)",
    mapUrl: "https://maps.google.com/?q=85+Hoa+Binh+Ninh+Kieu+Can+Tho",
  },
];

export default function StoreNetworkPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  const cities = ["all", "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"];

  const filteredStores = storesData.filter((store) => {
    const matchCity = selectedCity === "all" || store.city === selectedCity;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      store.name.toLowerCase().includes(q) ||
      store.nameEn.toLowerCase().includes(q) ||
      store.address.toLowerCase().includes(q) ||
      store.addressEn.toLowerCase().includes(q) ||
      store.city.toLowerCase().includes(q);
    return matchCity && matchSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header banner */}
      <div className="bg-gradient-to-b from-[#5c0000] via-[#530000] to-[#480000] text-white py-14 md:py-20 relative overflow-hidden">
        <div className="yody-container relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-red-200/80 mb-3">
            VIE&apos;CO • {isEn ? "Store Locations" : "Hệ Thống Cửa Hàng"}
          </p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            {isEn ? "Find A Store Near You" : "Tìm Cửa Hàng Gần Bạn"}
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto font-light leading-relaxed">
            {isEn
              ? "Experience traditional Vietnamese fashion identity with immersive AR Try-On directly in-store."
              : "Trải nghiệm không gian thời trang mang bản sắc Việt cùng công nghệ Thử đồ ảo AR trực tiếp tại cửa hàng."}
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="yody-container max-w-5xl -mt-8 relative z-20">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-neutral-200/80 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isEn ? "Search by address or city..." : "Tìm theo địa chỉ, quận, thành phố..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCity === city
                    ? "bg-[#530000] text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {city === "all" ? (isEn ? "All Cities" : "Tất cả") : city}
              </button>
            ))}
          </div>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200/80 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                    {isEn ? store.nameEn : store.name}
                  </h2>
                  {store.isFlagship && (
                    <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                      Flagship
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-sm text-neutral-600 mb-6">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 shrink-0 text-[#530000] mt-0.5" />
                    <span>{isEn ? store.addressEn : store.address}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 shrink-0 text-[#530000]" />
                    <a href={`tel:${store.phone}`} className="hover:text-[#530000] font-medium text-neutral-900">
                      {store.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 shrink-0 text-[#530000]" />
                    <span>{isEn ? store.hoursEn : store.hours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <a
                  href={`tel:${store.phone}`}
                  className="text-xs font-semibold text-neutral-700 hover:text-[#530000] transition-colors"
                >
                  {isEn ? "Call Hotline" : "Gọi Hotline"}
                </a>
                <a
                  href={store.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#530000] text-white text-xs font-semibold rounded-xl hover:bg-[#720000] transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {isEn ? "Get Directions" : "Chỉ đường"}
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
            <p className="text-neutral-500 text-sm">
              {isEn ? "No stores found matching your search criteria." : "Không tìm thấy cửa hàng phù hợp với tìm kiếm."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
