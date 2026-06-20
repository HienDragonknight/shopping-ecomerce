const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Đã xác nhận",  className: "bg-blue-100 text-blue-700 border-blue-200" },
  SHIPPING:  { label: "Đang giao",    className: "bg-purple-100 text-purple-700 border-purple-200" },
  DELIVERED: { label: "Đã giao",      className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Đã hủy",       className: "bg-red-100 text-red-600 border-red-200" },
};

const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  PAID:    { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-700" },
  UNPAID:  { label: "Chưa thanh toán", className: "bg-slate-100 text-slate-600" },
  REFUNDED:{ label: "Hoàn tiền",     className: "bg-orange-100 text-orange-700" },
};

const PRODUCT_STATUS: Record<string, { label: string; className: string }> = {
  ACTIVE:   { label: "Hiển thị", className: "bg-emerald-100 text-emerald-700" },
  INACTIVE: { label: "Ẩn",       className: "bg-slate-100 text-slate-500" },
};

const REVIEW_STATUS: Record<string, { label: string; className: string }> = {
  PENDING:  { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đã duyệt",  className: "bg-emerald-100 text-emerald-700" },
  HIDDEN:   { label: "Đã ẩn",     className: "bg-slate-100 text-slate-500" },
};

const COUPON_STATUS: Record<string, { label: string; className: string }> = {
  ACTIVE:   { label: "Đang hoạt động", className: "bg-emerald-100 text-emerald-700" },
  INACTIVE: { label: "Tắt",            className: "bg-slate-100 text-slate-500" },
  EXPIRED:  { label: "Hết hạn",        className: "bg-red-100 text-red-500" },
};

type StatusType = "order" | "payment" | "product" | "review" | "coupon";

interface StatusBadgeProps {
  type: StatusType;
  value: string;
}

export function StatusBadge({ type, value }: StatusBadgeProps) {
  const maps: Record<StatusType, Record<string, { label: string; className: string }>> = {
    order: ORDER_STATUS,
    payment: PAYMENT_STATUS,
    product: PRODUCT_STATUS,
    review: REVIEW_STATUS,
    coupon: COUPON_STATUS,
  };

  const map = maps[type];
  const status = map[value] ?? { label: value, className: "bg-slate-100 text-slate-500" };

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${status.className}`}>
      {status.label}
    </span>
  );
}

export { ORDER_STATUS, PAYMENT_STATUS };
