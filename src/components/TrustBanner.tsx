import Link from "next/link";

const trustItems = [
  {
    icon: "🔄",
    text: "Đổi, trả miễn phí tại nhà nếu không hài lòng",
    link: "/page/chinh-sach-bao-hanh-doi-tra",
    linkText: "Xem chính sách",
  },
  {
    icon: "🚚",
    text: "Miễn phí vận chuyển đơn từ 299K",
    link: "/page/chinh-sach-giao-nhan-hang-online",
    linkText: "Xem chi tiết",
  },
  {
    icon: "✅",
    text: "Hàng chính hãng – Chất lượng đảm bảo",
    link: "/page/gioi-thieu",
    linkText: null,
  },
  {
    icon: "📞",
    text: "Hotline tư vấn: 1800 2086",
    link: "tel:18002086",
    linkText: null,
  },
];

export function TrustBanner() {
  return (
    <div className="bg-[#FFF9E6] border-b border-[#F0E8C8]">
      <div className="yody-container">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-3">
          {trustItems.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-[#4A3F2F]">
              <span className="text-sm">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
              {item.link && item.linkText && (
                <Link
                  href={item.link}
                  className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:text-[#FCCE00] transition-colors ml-0.5"
                >
                  {item.linkText} ↗
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
