export function getPaymentMethodLabel(method: string | null | undefined): string {
  switch (method) {
    case "COD":
      return "Thanh toán khi nhận hàng (COD)";
    case "PAYOS":
      return "PayOS — Chuyển khoản QR";
    default:
      return method || "—";
  }
}
