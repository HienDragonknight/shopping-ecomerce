"use client";

import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";

interface PolicyContent {
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  contentVi: { heading: string; body: string | string[] }[];
  contentEn: { heading: string; body: string | string[] }[];
}

const pagesData: Record<string, PolicyContent> = {
  "gioi-thieu": {
    titleVi: "Giới Thiệu VIE'CO",
    titleEn: "About VIE'CO",
    subtitleVi: "Hành trình đưa bản sắc văn hoá Việt vào hơi thở thời trang hiện đại",
    subtitleEn: "Bringing Vietnamese cultural identity into contemporary fashion",
    contentVi: [
      {
        heading: "1. Về thương hiệu VIE'CO",
        body: "VIE'CO là thương hiệu thời trang tiên phong kết hợp giữa giá trị di sản văn hóa Việt Nam và ngôn ngữ thiết kế hiện đại. Chúng tôi mong muốn mỗi bộ trang phục không chỉ là một sản phẩm may mặc, mà còn là một câu chuyện văn hóa đầy tự hào.",
      },
      {
        heading: "2. Tầm nhìn & Sứ mệnh",
        body: [
          "Tầm nhìn: Trở thành biểu tượng thời trang mang đậm bản sắc văn hoá Việt Nam vươn tầm quốc tế.",
          "Sứ mệnh: Tôn vinh nét đẹp truyền thống qua từng đường kim mũi chỉ, ứng dụng công nghệ thực tế ảo AR và Virtual Try-On để nâng tầm trải nghiệm mua sắm của khách hàng.",
        ],
      },
      {
        heading: "3. Giá trị cốt lõi",
        body: "Bản sắc Việt – Sáng tạo & Hiện đại – Trải nghiệm công nghệ đột phá – Chất lượng chuẩn mực – Kết nối cộng đồng yêu văn hoá.",
      },
    ],
    contentEn: [
      {
        heading: "1. About VIE'CO",
        body: "VIE'CO is a pioneering fashion brand blending Vietnamese cultural heritage with modern contemporary design. Every piece of clothing tells a meaningful story of cultural pride.",
      },
      {
        heading: "2. Vision & Mission",
        body: [
          "Vision: To become an international fashion symbol rich in Vietnamese cultural identity.",
          "Mission: Honoring traditional aesthetics through meticulous craftsmanship while incorporating AR and Virtual Try-On technologies to revolutionize the shopping experience.",
        ],
      },
      {
        heading: "3. Core Values",
        body: "Vietnamese Heritage – Creativity & Innovation – Immersive Tech Experience – Premium Quality – Cultural Community Connection.",
      },
    ],
  },
  "chinh-sach-khach-hang-than-thiet": {
    titleVi: "Chính Sách Khách Hàng Thân Thiết",
    titleEn: "Loyalty Program Policy",
    subtitleVi: "Đặc quyền và ưu đãi tích điểm dành riêng cho hội viên VIE'CO",
    subtitleEn: "Exclusive privileges and reward tiers for VIE'CO members",
    contentVi: [
      {
        heading: "1. Điều kiện tham gia",
        body: "Tất cả khách hàng mua hàng tại website vietco.store hoặc hệ thống cửa hàng VIE'CO có tạo tài khoản thành viên đều tự động được tham gia chương trình khách hàng thân thiết.",
      },
      {
        heading: "2. Quy định tích luỹ điểm thưởng",
        body: [
          "Mỗi 100.000 VNĐ chi tiêu tương ứng với 1 điểm tích luỹ.",
          "Điểm thưởng có thể quy đổi thành mã giảm giá trực tiếp cho đơn hàng tiếp theo.",
          "Điểm có hạn sử dụng 12 tháng kể từ ngày tích luỹ gần nhất.",
        ],
      },
      {
        heading: "3. Các hạng thành viên & Ưu đãi",
        body: [
          "Hạng Đồng (Bronze): Chi tiêu từ 0 - 2.000.000 VNĐ (Nhận ưu đãi sinh nhật 5%).",
          "Hạng Bạc (Silver): Chi tiêu từ 2.000.000 - 10.000.000 VNĐ (Giảm 5% mọi đơn hàng, quà sinh nhật 10%).",
          "Hạng Vàng (Gold): Chi tiêu từ 10.000.000 - 25.000.000 VNĐ (Giảm 10% mọi đơn hàng, miễn phí vận chuyển toàn quốc, ưu đãi sinh nhật 15%).",
          "Hạng Kim Cương (Diamond): Chi tiêu trên 25.000.000 VNĐ (Giảm 15% trọn đời, quà tặng độc quyền mỗi bộ sưu tập mới, hỗ trợ stylist riêng).",
        ],
      },
    ],
    contentEn: [
      {
        heading: "1. Eligibility",
        body: "All customers with a registered account making purchases at vietco.store or VIE'CO physical stores automatically join our loyalty program.",
      },
      {
        heading: "2. Reward Points Accumulation",
        body: [
          "Every 100,000 VND spent earns 1 reward point.",
          "Points can be redeemed directly as discounts on future orders.",
          "Points are valid for 12 months from the latest qualifying purchase.",
        ],
      },
      {
        heading: "3. Membership Tiers & Benefits",
        body: [
          "Bronze Tier: 0 - 2,000,000 VND (5% birthday discount).",
          "Silver Tier: 2,000,000 - 10,000,000 VND (5% discount on all orders, 10% birthday discount).",
          "Gold Tier: 10,000,000 - 25,000,000 VND (10% discount on all orders, free national shipping, 15% birthday discount).",
          "Diamond Tier: Above 25,000,000 VND (15% lifetime discount, exclusive collection gifts, dedicated styling service).",
        ],
      },
    ],
  },
  "chinh-sach-bao-hanh-doi-tra": {
    titleVi: "Chính Sách Bảo Hành & Đổi Trả",
    titleEn: "Warranty & Return Policy",
    subtitleVi: "Cam kết đồng hành và bảo đảm quyền lợi tối đa cho khách hàng",
    subtitleEn: "Commitment to customer satisfaction and flexible return solutions",
    contentVi: [
      {
        heading: "1. Thời gian áp dụng đổi trả",
        body: "VIE'CO hỗ trợ đổi hàng trong vòng 15 ngày kể từ ngày khách hàng nhận được sản phẩm thành công.",
      },
      {
        heading: "2. Điều kiện đổi trả",
        body: [
          "Sản phẩm còn nguyên tem mác, hoá đơn mua hàng và chưa qua giặt tẩy, sử dụng hay có mùi lạ.",
          "Sản phẩm bị lỗi kỹ thuật từ nhà sản xuất (đường may, cúc áo, khoá kéo, chất vải loang màu không đúng mẫu).",
          "Sản phẩm giao không đúng size, màu sắc hoặc mã sản phẩm khách hàng đã đặt.",
        ],
      },
      {
        heading: "3. Quy trình thực hiện",
        body: [
          "Bước 1: Liên hệ hotline 0325994197 hoặc nhắn tin trực tiếp qua fanpage/email Vieco.vietnamesecostumes@gmail.com kèm video/hình ảnh unbox.",
          "Bước 2: Nhân viên VIE'CO kiểm tra và tạo đơn đổi hàng tận nhà hoặc hướng dẫn gửi hàng qua bưu cục.",
          "Bước 3: VIE'CO gửi sản phẩm mới đến khách hàng trong vòng 2-4 ngày làm việc.",
        ],
      },
      {
        heading: "4. Chi phí đổi trả",
        body: "Miễn phí 100% phí vận chuyển đối với trường hợp lỗi do nhà sản xuất hoặc giao sai mẫu. Khách hàng chỉ thanh toán phí ship 1 chiều trong trường hợp muốn đổi size/màu theo sở thích.",
      },
    ],
    contentEn: [
      {
        heading: "1. Return Period",
        body: "VIE'CO supports product exchanges within 15 days from the date of successful package delivery.",
      },
      {
        heading: "2. Conditions for Exchange",
        body: [
          "Items must have original tags attached, invoice, unwashed, unworn, and free of odors or alterations.",
          "Manufacturer defects in fabric, stitching, zippers, or buttons.",
          "Incorrect item, size, or color received compared to order details.",
        ],
      },
      {
        heading: "3. Process",
        body: [
          "Step 1: Contact hotline 0325994197 or email Vieco.vietnamesecostumes@gmail.com with your order number and unboxing video/photos.",
          "Step 2: Customer service verifies and arranges a doorstep pickup or return instructions.",
          "Step 3: VIE'CO ships the replacement product within 2-4 business days.",
        ],
      },
      {
        heading: "4. Return Shipping Fees",
        body: "100% free shipping for manufacturer errors or incorrect items. Standard 1-way shipping fee applies if exchanging size/style by customer preference.",
      },
    ],
  },
  "chinh-sach-bao-mat": {
    titleVi: "Chính Sách Bảo Mật Thông Tin",
    titleEn: "Privacy Policy",
    subtitleVi: "Cam kết bảo vệ tuyệt đối dữ liệu và quyền riêng tư cá nhân",
    subtitleEn: "Our commitment to safeguarding your personal data and privacy",
    contentVi: [
      {
        heading: "1. Mục đích thu thập thông tin",
        body: "VIE'CO thu thập thông tin của khách hàng (họ tên, số điện thoại, địa chỉ nhận hàng, email) nhằm xử lý đơn hàng, cung cấp dịch vụ giao vận, cập nhật ưu đãi và chăm sóc hậu mãi chu đáo.",
      },
      {
        heading: "2. Phạm vi sử dụng thông tin",
        body: "Thông tin cá nhân chỉ được sử dụng nội bộ trong phạm vi công ty VIE'CO và chia sẻ cho các đối tác vận chuyển (GHN, bưu tá) nhằm hoàn tất việc giao phát hàng hoá.",
      },
      {
        heading: "3. Bảo mật thanh toán",
        body: "Toàn bộ dữ liệu giao dịch trực tuyến qua cổng VNPay, PayOS và Stripe đều được mã hoá theo tiêu chuẩn bảo mật quốc tế PCI DSS, VIE'CO tuyệt đối không lưu trữ thông tin thẻ ngân hàng của khách hàng.",
      },
      {
        heading: "4. Quyền của khách hàng",
        body: "Khách hàng có quyền truy cập, chỉnh sửa hoặc yêu cầu xoá vĩnh viễn thông tin cá nhân của mình bất kỳ lúc nào bằng cách đăng nhập vào tài khoản hoặc liên hệ ban quản trị VIE'CO.",
      },
    ],
    contentEn: [
      {
        heading: "1. Purpose of Data Collection",
        body: "VIE'CO collects personal details (name, phone number, shipping address, email) solely to process orders, fulfill shipments, deliver promotions, and provide after-sales care.",
      },
      {
        heading: "2. Scope of Data Usage",
        body: "Personal information is strictly restricted to VIE'CO internal systems and authorized logistics partners (GHN) solely for delivery purposes.",
      },
      {
        heading: "3. Payment Security",
        body: "All online payment transactions through VNPay, PayOS, and Stripe are encrypted following PCI DSS international standards. VIE'CO never stores your credit card credentials.",
      },
      {
        heading: "4. Your Rights",
        body: "You have full rights to inspect, update, or request complete deletion of your data at any time via your account profile or by contacting support.",
      },
    ],
  },
  "chinh-sach-giao-nhan-hang-online": {
    titleVi: "Chính Sách Giao Nhận Hàng Online",
    titleEn: "Online Shipping & Delivery Policy",
    subtitleVi: "Thời gian giao hàng nhanh chóng, an toàn và đồng kiểm tin cậy",
    subtitleEn: "Fast, secure, and transparent doorstep delivery across Vietnam",
    contentVi: [
      {
        heading: "1. Phạm vi giao hàng",
        body: "VIE'CO cung cấp dịch vụ giao hàng tận nơi trên toàn quốc (63 tỉnh thành) thông qua đối tác chiến lược Giao Hàng Nhanh (GHN) và bưu điện.",
      },
      {
        heading: "2. Thời gian giao hàng dự kiến",
        body: [
          "Khu vực nội thành TP.HCM & Hà Nội: 1 - 2 ngày làm việc.",
          "Khu vực các tỉnh thành miền Nam, miền Trung, miền Bắc: 2 - 4 ngày làm việc.",
          "Khu vực huyện đảo / vùng sâu vùng xa: 4 - 6 ngày làm việc.",
        ],
      },
      {
        heading: "3. Phí vận chuyển",
        body: [
          "Miễn phí vận chuyển (Freeship) cho tất cả đơn hàng có giá trị từ 500.000 VNĐ trở lên trên toàn quốc.",
          "Đơn hàng dưới 500.000 VNĐ áp dụng mức phí đồng giá 25.000 - 35.000 VNĐ tuỳ khu vực địa lý.",
        ],
      },
      {
        heading: "4. Quy định đồng kiểm khi nhận hàng",
        body: "Khách hàng được quyền kiểm tra ngoại quan kiện hàng, số lượng và quy cách sản phẩm trước khi thanh toán cho nhân viên giao hàng (không thử đồ tại chỗ).",
      },
    ],
    contentEn: [
      {
        heading: "1. Delivery Coverage",
        body: "VIE'CO delivers nationwide across all 63 provinces in Vietnam via our logistics partner GHN and postal couriers.",
      },
      {
        heading: "2. Estimated Delivery Time",
        body: [
          "Urban Hanoi & HCMC: 1 - 2 business days.",
          "Other provinces and cities: 2 - 4 business days.",
          "Remote islands and district areas: 4 - 6 business days.",
        ],
      },
      {
        heading: "3. Shipping Fees",
        body: [
          "Free Shipping nationwide for all orders of 500,000 VND and above.",
          "Orders below 500,000 VND have a flat shipping rate of 25,000 - 35,000 VND depending on location.",
        ],
      },
      {
        heading: "4. Parcel Inspection",
        body: "Customers are entitled to inspect the parcel exterior and item quantity upon receipt before making payment to the delivery courier.",
      },
    ],
  },
  "bang-size-chuan": {
    titleVi: "Bảng Size Chuẩn VIE'CO",
    titleEn: "VIE'CO Standard Size Guide",
    subtitleVi: "Hướng dẫn chọn kích thước trang phục chuẩn form dáng người Việt",
    subtitleEn: "Comprehensive sizing chart tailored to Vietnamese and Asian fits",
    contentVi: [
      {
        heading: "1. Bảng size Áo & Trang phục nam / nữ (Unisex)",
        body: [
          "Size S: Chiều cao 1m50 - 1m60 | Cân nặng 45 - 55 kg | Vòng ngực 84 - 88 cm",
          "Size M: Chiều cao 1m60 - 1m70 | Cân nặng 55 - 65 kg | Vòng ngực 88 - 94 cm",
          "Size L: Chiều cao 1m70 - 1m78 | Cân nặng 65 - 75 kg | Vòng ngực 94 - 100 cm",
          "Size XL: Chiều cao 1m75 - 1m85 | Cân nặng 75 - 85 kg | Vòng ngực 100 - 108 cm",
          "Size XXL: Chiều cao 1m80 - 1m90 | Cân nặng 85 - 95 kg | Vòng ngực 108 - 116 cm",
        ],
      },
      {
        heading: "2. Hướng dẫn đo kích thước cơ thể",
        body: [
          "Vòng ngực: Dùng thước dây đo quanh vòng ngực nơi nở nhất, giữ thước thẳng ngang lưng.",
          "Vòng eo: Đo quanh vòng eo tự nhiên nhỏ nhất phía trên rốn khoảng 2-3 cm.",
          "Vòng mông: Đo quanh vị trí nở nhất của phần hông/mông.",
          "Chiều dài áo/quần: Đo từ chân cổ áo/lưng quần đến mép gấu áo/ống quần mong muốn.",
        ],
      },
      {
        heading: "3. Trải nghiệm Thử đồ ảo AI (Virtual Try-On)",
        body: "Nếu bạn còn phân vân về độ vừa vặn, hãy sử dụng tính năng Thử đồ ảo AI (Try-On) ngay trên từng trang chi tiết sản phẩm của VIE'CO để xem trước hình ảnh trang phục khi mặc lên người!",
      },
    ],
    contentEn: [
      {
        heading: "1. Unisex Apparel Size Chart",
        body: [
          "Size S: Height 150 - 160 cm | Weight 45 - 55 kg | Chest 84 - 88 cm",
          "Size M: Height 160 - 170 cm | Weight 55 - 65 kg | Chest 88 - 94 cm",
          "Size L: Height 170 - 178 cm | Weight 65 - 75 kg | Chest 94 - 100 cm",
          "Size XL: Height 175 - 185 cm | Weight 75 - 85 kg | Chest 100 - 108 cm",
          "Size XXL: Height 180 - 190 cm | Weight 85 - 95 kg | Chest 108 - 116 cm",
        ],
      },
      {
        heading: "2. How to Measure",
        body: [
          "Chest: Measure around the fullest part of the chest with tape held level.",
          "Waist: Measure around the narrowest part of your natural waist.",
          "Hips: Measure around the fullest point of your hips.",
          "Length: Measure from collar/waistband down to the garment hem.",
        ],
      },
      {
        heading: "3. AI Virtual Try-On",
        body: "Still unsure about the fit? Try our AI Virtual Try-On feature on every product page to visualize how the outfit looks on you before ordering!",
      },
    ],
  },
};

export default function PolicyPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { locale } = useLocale();
  const isEn = locale === "en";

  const page = pagesData[slug];

  if (!page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Trang không tìm thấy</h1>
        <p className="text-gray-600 mb-6">Nội dung bạn đang tìm kiếm hiện chưa sẵn sàng hoặc đã được di chuyển.</p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors"
        >
          Quay về Trang chủ
        </Link>
      </div>
    );
  }

  const contentList = isEn ? page.contentEn : page.contentVi;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Hero Header */}
      <div className="bg-[#530000] text-white py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="yody-container relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-red-200/80 mb-3">
            VIE&apos;CO • {isEn ? "Information & Policy" : "Chính Sách & Thông Tin"}
          </p>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3">
            {isEn ? page.titleEn : page.titleVi}
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto font-light">
            {isEn ? page.subtitleEn : page.subtitleVi}
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="yody-container max-w-4xl -mt-8 relative z-20">
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-neutral-200/70">
          <div className="space-y-8">
            {contentList.map((item, idx) => (
              <div key={idx} className="border-b border-neutral-100 pb-6 last:border-b-0 last:pb-0">
                <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#530000]" />
                  {item.heading}
                </h2>
                {Array.isArray(item.body) ? (
                  <ul className="space-y-2 pl-4 text-sm md:text-base text-neutral-700 leading-relaxed">
                    {item.body.map((line, lIdx) => (
                      <li key={lIdx} className="list-disc list-outside">
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm md:text-base text-neutral-700 leading-relaxed pl-4">
                    {item.body}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support Footer */}
          <div className="mt-10 pt-6 border-t border-neutral-200 bg-neutral-50 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-neutral-900">
                {isEn ? "Need further assistance?" : "Bạn cần hỗ trợ thêm thông tin?"}
              </p>
              <p className="text-xs text-neutral-600">
                {isEn ? "Contact our 24/7 customer care line: 0325994197" : "Tổng đài chăm sóc khách hàng: 0325994197"}
              </p>
            </div>
            <Link
              href="tel:0325994197"
              className="shrink-0 px-5 py-2 bg-[#530000] text-white text-xs font-semibold rounded-full hover:bg-[#720000] transition-colors"
            >
              {isEn ? "Call Now" : "Gọi ngay"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
