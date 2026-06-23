import type { Product, Collection, BlogPost, NavCategory, ProductSectionData } from "@/types";

export const collections: Collection[] = [
  { id: "1", name: "BST Dream Team Winner", slug: "dream-team-winner", image: "https://placehold.co/64x64/1A1A1A/FCCE00?text=DT" },
  { id: "2", name: "BST ÁO CHỐNG NẮNG", slug: "ao-chong-nang", image: "https://placehold.co/64x64/2d6a4f/ffffff?text=UV" },
  { id: "3", name: "BST SỊP ÊM", slug: "bst-sip-emmm", image: "https://placehold.co/64x64/9B59B6/ffffff?text=SÊ" },
  { id: "4", name: "ÁO GIỮ NHIỆT XTRA-HEAT™", slug: "ao-giu-nhiet-xtra-heat", image: "https://placehold.co/64x64/E53E3E/ffffff?text=XH" },
  { id: "5", name: "BST JEAN FLEX", slug: "jeans-collection", image: "https://placehold.co/64x64/1565C0/ffffff?text=JF" },
  { id: "6", name: "BST BUSINESS CASUAL", slug: "bst-business-casual", image: "https://placehold.co/64x64/37474F/ffffff?text=BC" },
  { id: "7", name: "BST SPORT NHẸ TÊNH", slug: "yody-sport-nhe-tenh", image: "https://placehold.co/64x64/F5A623/ffffff?text=SP" },
  { id: "8", name: "BST EVERYDAY BASIC", slug: "everyday-basics", image: "https://placehold.co/64x64/555555/ffffff?text=EB" },
];

function pImg(w: number, h: number, bg: string, label: string) {
  const lower = label.toLowerCase();
  const index = label.length % 2; // Simple pseudo-random toggle based on label length
  
  if (lower.includes('polo')) {
    return index === 0 ? '/images/model_polo.png' : '/images/model_polo_2.png';
  }
  
  if (['cá+sấu', 'adventure', 'ariel', 'thỏ', 'teen', 'summer', 'dream', 'wild'].includes(lower)) {
    return '/images/model_kids.png';
  }
  
  if (['acn', 'anti', 'mũ', 'găng', 'baggy', 'thêu', 'barrel', 'can', 'slim', 'coolmax', 'straight', 'regular'].some(k => lower.includes(k))) {
    return '/images/model_jeans.png';
  }

  // Default to office wear
  return index === 0 ? '/images/model_office.png' : '/images/model_office_2.png';
}

const easyofficeProducts: Product[] = [
  { id: "eo1", name: "Áo Sơ-mi nam dài tay kẻ caro cao cấp", price: 299000, image: pImg(300, 400, "D4E6F1", "Sơ+Mi"), slug: "ao-so-mi-karo" },
  { id: "eo2", name: "Áo Sơ-mi Regular Classic Good Essential", price: 599000, image: pImg(300, 400, "AED6F1", "Classic"), slug: "ao-so-mi-classic" },
  { id: "eo3", name: "Áo Sơ-mi Regular Fit Cotton Wrinkle Less", price: 429000, image: pImg(300, 400, "D5E8D4", "Cotton"), slug: "ao-so-mi-cotton" },
  { id: "eo4", name: "Áo Sơ-mi Nữ Relax Fit Cotton Blend", price: 499000, image: pImg(300, 400, "FCE4EC", "Relax+Fit"), slug: "ao-so-mi-nu" },
  { id: "eo5", name: "Áo Sơ-mi Nữ NANO Regular Essential", price: 599000, image: pImg(300, 400, "E8DAEF", "NANO"), slug: "ao-so-mi-nano" },
  { id: "eo6", name: "Quần Âu Nam Cạp Chun Siêu Phẳng", price: 319200, originalPrice: 399000, image: pImg(300, 400, "FDEBD0", "Quần+Âu"), slug: "quan-au-nam" },
  { id: "eo7", name: "Quần Tây Nữ Straight Essential", price: 429000, image: pImg(300, 400, "EBF5FB", "Straight"), slug: "quan-tay-nu" },
  { id: "eo8", name: "Chân Váy Pencil Under The Knee Essential", price: 319200, originalPrice: 399000, image: pImg(300, 400, "FDF2F8", "Pencil"), slug: "chan-vay-pencil" },
];

const poloProducts: Product[] = [
  { id: "p1", name: "Áo Polo Nam Regular Cổ Ép Có Xẻ Tà - Thoáng Khí", price: 199000, image: pImg(300, 400, "1A1A1A", "Polo+Nam"), slug: "polo-nam-regular" },
  { id: "p2", name: "Áo Polo Nữ Regular Cổ Ép Có Xẻ Tà", price: 199000, image: pImg(300, 400, "E8F8F5", "Polo+Nữ"), slug: "polo-nu-regular" },
  { id: "p3", name: "Áo Polo Nam Slim Có Khóa Kéo", price: 329000, image: pImg(300, 400, "2E86C1", "Polo+Slim"), slug: "polo-nam-slim" },
  { id: "p4", name: "Áo Polo Nam Hoạ Tiết In Tràn", price: 329000, image: pImg(300, 400, "1E8449", "Hoạ+Tiết"), slug: "polo-hoa-tiet" },
  { id: "p5", name: "Áo Polo In Tràn Hoạ Tiết", price: 499000, image: pImg(300, 400, "9B59B6", "In+Tràn"), slug: "polo-in-tran" },
  { id: "p6", name: "Áo Polo Nam Slim In Thân Trước Có Xẻ Tà", price: 399000, image: pImg(300, 400, "E74C3C", "Slim+Print"), slug: "polo-slim-print" },
  { id: "p7", name: "Áo Polo Nữ Slim In Thân Trước Có Xẻ Tà", price: 349000, image: pImg(300, 400, "F39C12", "Polo+Nữ"), slug: "polo-nu-slim" },
  { id: "p8", name: "Áo Polo Nam Phối Dây Dệt Năng Động", price: 329000, image: pImg(300, 400, "2C3E50", "Dây+Dệt"), slug: "polo-day-det" },
];

const saleProducts: Product[] = [
  { id: "s1", name: "Áo Ba Lỗ Nữ Cotton Hack Dáng", price: 49000, image: pImg(300, 400, "F8BBD9", "Ba+Lỗ"), slug: "ao-ba-lo-nu" },
  { id: "s2", name: "T-shirt Nữ Slimfit Thun Rib Tăm Nhỏ", price: 79000, image: pImg(300, 400, "C8E6C9", "Slimfit"), slug: "tshirt-nu-slim" },
  { id: "s3", name: "Áo Sơ Mi Nam Business Knit Phối Nép Giấu Cúc", price: 199000, image: pImg(300, 400, "B3E5FC", "Business"), slug: "so-mi-business" },
  { id: "s4", name: "Áo sơ mi cộc tay sợi tre họa tiết", price: 199000, image: pImg(300, 400, "DCEDC8", "Sợi+Tre"), slug: "so-mi-soi-tre" },
  { id: "s5", name: "Sơ Mi Dài Tay Nam Knit Tay Kiểu", price: 199000, image: pImg(300, 400, "E1BEE7", "Knit"), slug: "so-mi-knit" },
  { id: "s6", name: "Áo 2 Dây Nữ Cổ Rộng", price: 99000, image: pImg(300, 400, "FFECB3", "2+Dây"), slug: "ao-2-day" },
  { id: "s7", name: "Áo Phông Nữ Bổ Thân Gắn Tag Kim Loại", price: 99000, image: pImg(300, 400, "F8BBD9", "Tag+Kim"), slug: "phong-nu-tag" },
  { id: "s8", name: "Áo Polo Nữ Airycool Giữ Form Thoáng Mát", price: 149000, image: pImg(300, 400, "B2EBF2", "Airycool"), slug: "polo-airycool" },
];

const kidProducts: Product[] = [
  { id: "k1", name: "Áo Phông Cá Sấu Lớn", price: 99000, image: pImg(300, 400, "A5D6A7", "Cá+Sấu"), slug: "phong-ca-sau" },
  { id: "k2", name: "Áo phông adventure", price: 124500, originalPrice: 249000, image: pImg(300, 400, "FFD54F", "Adventure"), slug: "phong-adventure" },
  { id: "k3", name: "Áo Phông Bé Gái Ariel", price: 149000, image: pImg(300, 400, "F48FB1", "Ariel"), slug: "phong-ariel" },
  { id: "k4", name: "Áo Phông In Tràn Chú Thỏ", price: 135200, originalPrice: 169000, image: pImg(300, 400, "CE93D8", "Thỏ"), slug: "phong-tho" },
  { id: "k5", name: "Áo Polo Teen Cổ Ép Có Xẻ Tà", price: 119200, originalPrice: 149000, image: pImg(300, 400, "80DEEA", "Teen"), slug: "polo-teen" },
  { id: "k6", name: "Áo Phông Kid Summer Together", price: 159200, originalPrice: 199000, image: pImg(300, 400, "FFB74D", "Summer"), slug: "phong-summer" },
  { id: "k7", name: "Áo Phông Trẻ Em Dream Team", price: 159200, originalPrice: 199000, image: pImg(300, 400, "4FC3F7", "Dream"), slug: "phong-dream-team" },
  { id: "k8", name: "Áo Phông Wild Discovery", price: 159200, originalPrice: 199000, image: pImg(300, 400, "A5D6A7", "Wild"), slug: "phong-wild" },
];

const sunProtectionProducts: Product[] = [
  { id: "sp1", name: "Áo Khoác Chống Nắng Toàn Thân (ACN6002)", price: 559300, originalPrice: 799000, image: pImg(300, 400, "B2DFDB", "ACN+Toàn"), slug: "acn-toan-than" },
  { id: "sp2", name: "Áo Khoác Chống Nắng Nữ Đa Năng", price: 369000, image: pImg(300, 400, "E8F5E9", "ACN+Nữ"), slug: "acn-nu-da-nang" },
  { id: "sp3", name: "Áo Chống Nắng Nữ Đa Năng Anti UV - Versatile", price: 314300, originalPrice: 449000, image: pImg(300, 400, "C8E6C9", "Anti+UV"), slug: "acn-anti-uv" },
  { id: "sp4", name: "Áo Chống Nắng Nam Có Mũ", price: 599000, image: pImg(300, 400, "1B5E20", "ACN+Mũ"), slug: "acn-nam-mu" },
  { id: "sp5", name: "Áo Khoác Chống Nắng Thời Trang Mũ Liền", price: 629000, image: pImg(300, 400, "2E7D32", "Mũ+Liền"), slug: "acn-mu-lien" },
  { id: "sp6", name: "Găng Tay Chống Nắng Anti UV", price: 129000, image: pImg(300, 400, "F1F8E9", "Găng+Tay"), slug: "gang-tay-acn" },
  { id: "sp7", name: "Áo Khoác Chống Nắng Siêu Thoải Mái (ACN7004)", price: 439200, originalPrice: 549000, image: pImg(300, 400, "DCEDC8", "ACN7004"), slug: "acn-sieu-thoai" },
  { id: "sp8", name: "Áo Khoác Chống Nắng Nữ Đa Năng (ACN6008)", price: 314300, originalPrice: 449000, image: pImg(300, 400, "B2DFDB", "ACN6008"), slug: "acn-nu-6008" },
];

const jeansProducts: Product[] = [
  { id: "j1", name: "Quần Jeans Nữ Straight Cắt Cúp", price: 629000, image: pImg(300, 400, "1565C0", "Straight"), slug: "jeans-nu-straight" },
  { id: "j2", name: "Quần Jeans Nữ Baggy Xếp Ly", price: 399000, image: pImg(300, 400, "1E88E5", "Baggy"), slug: "jeans-nu-baggy" },
  { id: "j3", name: "Quần Jeans Nữ Straight Thêu Túi Hậu", price: 569000, image: pImg(300, 400, "42A5F5", "Thêu"), slug: "jeans-nu-theu" },
  { id: "j4", name: "Quần Jeans Nam Regular Siêu Nhẹ Co Giãn", price: 699000, image: pImg(300, 400, "0D47A1", "Regular"), slug: "jeans-nam-nhe" },
  { id: "j5", name: "Quần Jeans Nữ Barrel Light Weight", price: 499000, image: pImg(300, 400, "1976D2", "Barrel"), slug: "jeans-nu-barrel" },
  { id: "j6", name: "Quần Jeans Nam Regular Can Túi", price: 399000, image: pImg(300, 400, "2196F3", "Can+Túi"), slug: "jeans-nam-can" },
  { id: "j7", name: "Quần Jeans Nam Slim Denim Like (QJM6041)", price: 599000, image: pImg(300, 400, "1565C0", "Slim"), slug: "jeans-nam-slim" },
  { id: "j8", name: "Quần Jeans Nam Regular Coolmax Black Titan", price: 649000, image: pImg(300, 400, "212121", "Coolmax"), slug: "jeans-nam-coolmax" },
];

export const productSections: ProductSectionData[] = [
  { id: "easyoffice", title: "EASY OFFICE", viewMoreLink: "/collection/EASYOFFICE", products: easyofficeProducts },
  { id: "polo", title: "POLO ALL-IN-ONE", viewMoreLink: "/collection/POLO-ALL-IN-ONE", products: poloProducts },
  { id: "sale", title: "TIẾT KIỆM LÊN ĐẾN 400K", viewMoreLink: "/collection/tiet-kiem-len-den-400k", products: saleProducts },
  { id: "kids", title: "TỦ ĐỒ CHO BÉ", viewMoreLink: "/collection/kid-20", products: kidProducts },
  { id: "sun", title: "BST ÁO CHỐNG NẮNG", viewMoreLink: "/collection/ao-chong-nang", products: sunProtectionProducts },
  { id: "jeans", title: "BST JEAN FLEX", viewMoreLink: "/collection/jeans-collection", products: jeansProducts },
];

export const blogPosts: BlogPost[] = [
  { id: "b1", title: "Khám phá BST EASYOFFICE mới nhất từ Yody – Giải pháp cho thời trang công sở năng động", date: "2026-05-20", image: "https://placehold.co/400x300/D4E6F1/1A1A1A?text=EasyOffice", slug: "bst-easyoffice" },
  { id: "b2", title: "Mua áo polo chính hãng ở đâu? 10 Áo polo được săn đón ở YODY", date: "2026-05-18", image: "https://placehold.co/400x300/D5E8D4/1A1A1A?text=Polo", slug: "ao-polo-chinh-hang" },
  { id: "b3", title: "Áo polo oversize nam: 10 mẫu đẹp & cách phối đồ sành điệu", date: "2026-05-15", image: "https://placehold.co/400x300/FDEBD0/1A1A1A?text=Oversize", slug: "ao-polo-oversize-nam" },
  { id: "b4", title: "Quốc tế Thiếu nhi ngày mấy? Gợi ý outfit cho bé đi chơi 1/6", date: "2026-05-28", image: "https://placehold.co/400x300/FCE4EC/1A1A1A?text=Kid+1%2F6", slug: "quoc-te-thieu-nhi-ngay-may" },
  { id: "b5", title: "Áo chống nắng nữ siêu thoáng - Cứu tinh giữa mùa hè ngột ngạt", date: "2026-05-22", image: "https://placehold.co/400x300/E8F5E9/1A1A1A?text=Chống+Nắng", slug: "ao-chong-nang-nu" },
  { id: "b6", title: "World Cup 2026 khi nào khai mạc? Gợi ý outfit xem World Cup cực chất", date: "2026-06-01", image: "https://placehold.co/400x300/EBF5FB/1A1A1A?text=World+Cup", slug: "world-cup-2026-khi-nao-khai-mac" },
];

export const navCategories: NavCategory[] = [
  {
    name: "Nam",
    nameEn: "Men",
    href: "/category/nam",
    groups: [
      { 
        title: "Áo khoác", 
        titleEn: "Jackets",
        items: [
          { name: "Áo chống nắng nam", nameEn: "Sunscreen Jackets", href: "#" }, 
          { name: "Áo phao nam", nameEn: "Puffer Jackets", href: "#" }, 
          { name: "Áo gió nam", nameEn: "Windbreakers", href: "#" }, 
          { name: "Áo vest nam", nameEn: "Blazers & Vests", href: "#" }
        ] 
      },
      { 
        title: "Áo nam", 
        titleEn: "Tops",
        items: [
          { name: "Áo polo nam", nameEn: "Polo Shirts", href: "#" }, 
          { name: "Áo sơ mi nam", nameEn: "Button-downs", href: "#" }, 
          { name: "Áo thun nam", nameEn: "T-Shirts", href: "#" }, 
          { name: "Áo len nam", nameEn: "Sweaters", href: "#" }, 
          { name: "Áo hoodie - nỉ nam", nameEn: "Hoodies & Sweats", href: "#" }
        ] 
      },
      { 
        title: "Quần nam", 
        titleEn: "Bottoms",
        items: [
          { name: "Quần âu nam", nameEn: "Dress Pants", href: "#" }, 
          { name: "Quần jeans nam", nameEn: "Jeans", href: "#" }, 
          { name: "Quần short nam", nameEn: "Shorts", href: "#" }, 
          { name: "Quần kaki nam", nameEn: "Khakis", href: "#" }
        ] 
      },
      { 
        title: "Đồ thể thao nam", 
        titleEn: "Activewear",
        items: [
          { name: "Áo polo thể thao nam", nameEn: "Active Polos", href: "#" }, 
          { name: "Áo thun thể thao nam", nameEn: "Active Tees", href: "#" }, 
          { name: "Quần thể thao nam", nameEn: "Active Pants", href: "#" }
        ] 
      },
    ],
  },
  {
    name: "Nữ",
    nameEn: "Women",
    href: "/category/nu",
    groups: [
      { 
        title: "Áo khoác", 
        titleEn: "Jackets",
        items: [
          { name: "Áo chống nắng nữ", nameEn: "Sunscreen Jackets", href: "#" }, 
          { name: "Áo phao nữ", nameEn: "Puffer Jackets", href: "#" }, 
          { name: "Áo gió nữ", nameEn: "Windbreakers", href: "#" }, 
          { name: "Áo vest nữ", nameEn: "Blazers", href: "#" }, 
          { name: "Áo măng tô nữ", nameEn: "Trench Coats", href: "#" }
        ] 
      },
      { 
        title: "Áo nữ", 
        titleEn: "Tops",
        items: [
          { name: "Áo polo nữ", nameEn: "Polo Shirts", href: "#" }, 
          { name: "Áo thun nữ", nameEn: "T-Shirts", href: "#" }, 
          { name: "Áo sơ mi nữ", nameEn: "Button-downs", href: "#" }, 
          { name: "Áo len nữ", nameEn: "Sweaters", href: "#" }, 
          { name: "Áo hoodie - nỉ nữ", nameEn: "Hoodies & Sweats", href: "#" }
        ] 
      },
      { 
        title: "Quần nữ", 
        titleEn: "Bottoms",
        items: [
          { name: "Quần âu nữ", nameEn: "Dress Pants", href: "#" }, 
          { name: "Quần jeans nữ", nameEn: "Jeans", href: "#" }, 
          { name: "Quần short nữ", nameEn: "Shorts", href: "#" }, 
          { name: "Chân váy nữ", nameEn: "Skirts", href: "#" }, 
          { name: "Đầm nữ", nameEn: "Dresses", href: "#" }
        ] 
      },
      { 
        title: "Đồ bộ nữ", 
        titleEn: "Matching Sets",
        items: [
          { name: "Đồ bộ dài tay nữ", nameEn: "Long Sleeve Sets", href: "#" }, 
          { name: "Đồ bộ ngắn tay nữ", nameEn: "Short Sleeve Sets", href: "#" }, 
          { name: "Bộ thể thao nữ", nameEn: "Activewear Sets", href: "#" }
        ] 
      },
    ],
  },
  {
    name: "Trẻ em",
    nameEn: "Kids",
    href: "/category/tre-em",
    groups: [
      { 
        title: "Áo trẻ em", 
        titleEn: "Kids Tops",
        items: [
          { name: "Áo sơ mi trẻ em", nameEn: "Shirts", href: "#" }, 
          { name: "Áo polo trẻ em", nameEn: "Polos", href: "#" }, 
          { name: "Áo thun trẻ em", nameEn: "T-Shirts", href: "#" }, 
          { name: "Áo len trẻ em", nameEn: "Sweaters", href: "#" }, 
          { name: "Áo hoodie trẻ em", nameEn: "Hoodies", href: "#" }
        ] 
      },
      { 
        title: "Quần trẻ em", 
        titleEn: "Kids Bottoms",
        items: [
          { name: "Quần jeans trẻ em", nameEn: "Jeans", href: "#" }, 
          { name: "Quần short trẻ em", nameEn: "Shorts", href: "#" }, 
          { name: "Quần nỉ trẻ em", nameEn: "Sweatpants", href: "#" }, 
          { name: "Quần kaki trẻ em", nameEn: "Khakis", href: "#" }
        ] 
      },
      { 
        title: "Đồ bộ trẻ em", 
        titleEn: "Kids Sets",
        items: [
          { name: "Đồ bộ dài tay trẻ em", nameEn: "Long Sleeve Sets", href: "#" }, 
          { name: "Đồ bộ ngắn tay trẻ em", nameEn: "Short Sleeve Sets", href: "#" }
        ] 
      },
      { 
        title: "Bé gái", 
        titleEn: "Girls Wear",
        items: [
          { name: "Chân váy bé gái", nameEn: "Skirts", href: "#" }, 
          { name: "Đầm bé gái", nameEn: "Dresses", href: "#" }
        ] 
      },
    ],
  },
];
