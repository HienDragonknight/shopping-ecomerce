// ─── Frontend domain types ────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  colors?: string[];
  badge?: string;
  slug: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface BannerSlide {
  id: string;
  badge?: string;
  badgeColor: string;
  titleText: string;
  subtitle: string;
  ctaText: string;
  textColor: string;
  overlayGradient: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
  slug: string;
}

export interface NavSubcategory {
  name: string;
  nameEn?: string;
  href: string;
}

export interface NavGroup {
  title: string;
  titleEn?: string;
  items: NavSubcategory[];
}

export interface NavCategory {
  name: string;
  nameEn?: string;
  href: string;
  groups?: NavGroup[];
}

export interface ProductSectionData {
  id: string;
  title: string;
  viewMoreLink: string;
  products: Product[];
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiProductCard {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
}

export interface ApiProductSection {
  id: string;
  title: string;
  viewMoreLink: string;
  products: ApiProductCard[];
}

export interface ApiCollection {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
}

export interface ApiBannerSlide {
  id: number;
  badge?: string;
  badgeColor: string;
  titleText: string;
  subtitle: string;
  ctaText: string;
  textColor: string;
  overlayGradient: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
}

export interface ApiBlogPost {
  id: number;
  title: string;
  slug: string;
  date: string;
  image: string;
}
