"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";

interface HeritageItem {
  id: string;
  name: string;
  nameEn: string;
  era: string;
  eraEn: string;
  fabric: string;
  fabricEn: string;
  description: string;
  descriptionEn: string;
  imageUrl: string;
  hotspots: {
    x: string;
    y: string;
    title: string;
    titleEn: string;
    desc: string;
    descEn: string;
  }[];
}

const HERITAGE_ITEMS: HeritageItem[] = [
  {
    id: "nhat-binh",
    name: "Áo Nhật Bình (Triều Nguyễn)",
    nameEn: "Nhat Binh Gown (Nguyen Dynasty)",
    era: "Thời Nguyễn (Thế kỷ 19 - 20)",
    eraEn: "Nguyen Dynasty (19th - 20th Century)",
    fabric: "Tơ tằm tự nhiên, dệt vân sa",
    fabricEn: "Natural silk, plain weave",
    description: "Nhật Bình là triều phục dành cho hoàng thái hậu, hoàng hậu, công chúa và phi tần triều Nguyễn. Tên gọi xuất phát từ hoa văn ở cổ áo ghép lại thành hình chữ nhật ngay trước ngực.",
    descriptionEn: "Nhat Binh was the royal court gown for Empresses and Princesses of the Nguyen Dynasty. The name comes from the rectangular shape formed by the collar bands in the front.",
    imageUrl: "https://images.unsplash.com/photo-1621600411688-4be93cc685e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    hotspots: [
      { x: "50%", y: "25%", title: "Cổ áo Nhật Bình", titleEn: "Collar Band", desc: "Dải cổ áo đối khâm ghép thành hình chữ nhật đặc trưng, thêu phượng và mây ngũ sắc.", descEn: "Opposing rectangular bands decorated with embroidered phoenixes and five-colored clouds." },
      { x: "30%", y: "60%", title: "Hoa văn Thủy Ba", titleEn: "Thuy Ba (Water Wave) Pattern", desc: "Tượng trưng cho sự thái bình, thịnh trị của đất nước.", descEn: "Symbolizes peace, stability, and royal prosperity." }
    ]
  },
  {
    id: "ao-dai-gam",
    name: "Áo Dài Gấm Cổ Phục",
    nameEn: "Royal Brocade Ao Dai",
    era: "Thời Lê - Nguyễn",
    eraEn: "Le - Nguyen Dynasty era",
    fabric: "Gấm dệt tơ tơ vàng thượng hạng",
    fabricEn: "Premium golden woven brocade",
    description: "Phiên bản áo dài ngũ thân cổ đứng truyền thống dệt từ gấm tơ tằm nguyên bản, phom dáng thụng sang trọng tôn vinh phong thái nho nhã.",
    descriptionEn: "Traditional five-panel high-collar Ao Dai made of premium silk brocade, designed with a loose royal fit to represent nobility and grace.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    hotspots: [
      { x: "50%", y: "15%", title: "Cổ đứng lập lĩnh", titleEn: "Mandarin Collar", desc: "Cổ cao 4cm đứng thẳng tôn vẻ đoan trang, cài nút thắt đồng thủ công.", descEn: "4cm high straight collar, fastened with handcrafted bronze buttons." },
      { x: "45%", y: "45%", title: "Vân mây chữ Thọ", titleEn: "Cloud & Longevity Motif", desc: "Họa tiết dệt nổi cổ điển cầu chúc trường thọ và vạn sự cát tường.", descEn: "Classic woven motifs representing longevity, good fortune, and health." }
    ]
  }
];

export default function ArScanPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const [selectedItem, setSelectedItem] = useState<HeritageItem>(HERITAGE_ITEMS[0]);
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  
  // AR Camera View state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when leaving page or toggling off
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      setCameraError(isEn ? "Failed to access camera. Please check permissions." : "Không thể truy cập camera. Vui lòng kiểm tra quyền thiết bị.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 1.8));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.7));
  const rotateLeft = () => setRotation(r => r - 15);
  const rotateRight = () => setRotation(r => r + 15);

  const resetView = () => {
    setRotation(0);
    setZoom(1);
    setActiveHotspot(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* Top Breadcrumbs */}
      <div className="bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/vieco-tech" className="hover:text-white">Vie'Co Tech</Link>
          <span>/</span>
          <span className="font-semibold text-white">AR Heritage Scan</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center md:text-left mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">AR Heritage Scan</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              {isEn
                ? "Interact with 3D models of Vietnamese traditional attire and launch your AR camera mirror."
                : "Tương tác với trang phục cổ truyền Việt Nam dưới dạng 3D và kích hoạt gương soi camera AR."}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                if (isCameraActive) {
                  stopCamera();
                } else {
                  startCamera();
                }
              }}
              className={`px-6 py-3 rounded-full text-xs font-black tracking-wider uppercase transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                isCameraActive
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-amber-500 text-slate-950 hover:bg-amber-400"
              }`}
            >
              {isCameraActive
                ? (isEn ? "✕ Close AR Camera" : "✕ Tắt Gương AR")
                : (isEn ? "✦ Open AR Camera" : "✦ Bật Gương AR")}
            </button>
            <button
              onClick={resetView}
              className="px-5 py-3 rounded-full text-xs font-bold border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              {isEn ? "Reset View" : "Đặt lại góc nhìn"}
            </button>
          </div>
        </div>

        {cameraError && (
          <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-4 text-sm text-red-300 text-center mb-6 max-w-3xl mx-auto">
            ⚠ {cameraError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          
          {/* LEFT VIEWPORT */}
          <div className="relative aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[600px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl">
            
            {/* Grid background simulation */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {isCameraActive ? (
              // ── REAL TIME AR CAMERA VIEW ──
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* Overlay simulated garment fitting in center */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-16">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedItem.imageUrl}
                    alt="AR fitting"
                    className="h-full max-h-[85%] w-auto object-contain opacity-75 mix-blend-screen transition-transform duration-300"
                    style={{
                      transform: `rotateY(${rotation}deg) scale(${zoom})`,
                    }}
                  />
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <p className="text-slate-300 font-medium">
                    {isEn ? "AR Mirror View - Align your body" : "Gương quét AR - Hãy điều chỉnh thân người thẳng"}
                  </p>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
            ) : (
              // ── 3D MODEL VIEWER VIEW ──
              <div className="relative w-full h-full flex items-center justify-center p-8">
                {/* 3D Canvas Box Container */}
                <div 
                  className="relative h-[85%] max-h-[480px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 transition-all duration-300"
                  style={{
                    transform: `perspective(1000px) rotateY(${rotation}deg) scale(${zoom})`,
                    transformStyle: "preserve-3d"
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  
                  {/* Overlay shadow gradient to simulate depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                  {/* Hotspots */}
                  {selectedItem.hotspots.map((hs, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveHotspot(idx)}
                      style={{ left: hs.x, top: hs.y }}
                      className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg hover:scale-125 transition-transform animate-bounce z-20 cursor-pointer"
                      title={isEn ? hs.titleEn : hs.title}
                    >
                      +
                    </button>
                  ))}
                </div>

                {/* Hotspot details tooltip overlay */}
                {activeHotspot !== null && (
                  <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2">
                    <button
                      onClick={() => setActiveHotspot(null)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                    <h5 className="font-extrabold text-sm text-amber-400 mb-1">
                      {isEn ? selectedItem.hotspots[activeHotspot].titleEn : selectedItem.hotspots[activeHotspot].title}
                    </h5>
                    <p className="text-slate-300 text-xs leading-relaxed font-medium">
                      {isEn ? selectedItem.hotspots[activeHotspot].descEn : selectedItem.hotspots[activeHotspot].desc}
                    </p>
                  </div>
                )}

                {/* Virtual Camera Info */}
                <div className="absolute bottom-4 left-4 text-xs text-slate-500">
                  {isEn ? "Drag-rotation simulator active" : "Trình mô phỏng xoay 3D đang hoạt động"}
                </div>
              </div>
            )}

            {/* Viewport Control overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={rotateLeft}
                className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-800 hover:bg-slate-800 flex items-center justify-center"
                title={isEn ? "Rotate Left" : "Xoay Trái"}
              >
                ↺
              </button>
              <button
                onClick={rotateRight}
                className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-800 hover:bg-slate-800 flex items-center justify-center"
                title={isEn ? "Rotate Right" : "Xoay Phải"}
              >
                旋
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-800 hover:bg-slate-800 flex items-center justify-center font-bold"
                title={isEn ? "Zoom Out" : "Thu Nhỏ"}
              >
                -
              </button>
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-800 hover:bg-slate-800 flex items-center justify-center font-bold"
                title={isEn ? "Zoom In" : "Phóng To"}
              >
                +
              </button>
            </div>
          </div>

          {/* RIGHT PANELS */}
          <div className="space-y-6">
            
            {/* Heritage item catalog */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-widest">
                {isEn ? "Heritage Catalog" : "Bộ Sưu Tập Cổ Phục"}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {HERITAGE_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      resetView();
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      selectedItem.id === item.id
                        ? "bg-amber-500/10 border-amber-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-800 border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">
                        {isEn ? item.nameEn : item.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isEn ? item.eraEn : item.era}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Historical Details card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-widest">
                {isEn ? "Historical Context" : "Chi Tiết Cổ Nhân"}
              </h4>
              <div className="space-y-3.5">
                <div>
                  <span className="text-slate-500 text-xs font-semibold block">{isEn ? "Fabric" : "Chất liệu dệt"}</span>
                  <span className="text-white text-sm font-bold mt-0.5 block">{isEn ? selectedItem.fabricEn : selectedItem.fabric}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block">{isEn ? "Era" : "Niên đại cổ"}</span>
                  <span className="text-white text-sm font-bold mt-0.5 block">{isEn ? selectedItem.eraEn : selectedItem.era}</span>
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">
                    {isEn ? selectedItem.descriptionEn : selectedItem.description}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
