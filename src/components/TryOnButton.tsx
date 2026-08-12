"use client";

import { useRouter } from "next/navigation";

interface Props {
  productId: number;
  color?: string;
  className?: string;
}

export default function TryOnButton({ productId, color, className = "" }: Props) {
  const router = useRouter();

  const handleNavigate = () => {
    const url = `/try-on?productId=${productId}${color ? `&color=${encodeURIComponent(color)}` : ""}`;
    router.push(url);
  };

  return (
    <button
      id={`try-on-btn-${productId}`}
      onClick={handleNavigate}
      className={`group flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-black bg-white hover:bg-black text-black hover:text-white rounded-xl transition-all duration-200 text-sm font-semibold ${className}`}
    >
      {/* Shirt icon */}
      <svg
        className="w-4 h-4 transition-transform group-hover:scale-110"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.86H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.86l.58-3.57a2 2 0 00-1.34-2.23z" />
      </svg>
      <span className="font-bold">Thử đồ ảo</span>
      <span className="text-[10px] font-black bg-black text-white group-hover:bg-white group-hover:text-black px-1.5 py-0.5 rounded-full transition-colors">
        AI
      </span>
    </button>
  );
}
