export type FaqIconKey =
  | "general"
  | "account"
  | "qa"
  | "vip"
  | "safety"
  | "technical";

export type FaqItem = {
  q: string;
  a: string;
};

export type FaqCategory = {
  id: string;
  label: string;
  icon: FaqIconKey | string;
  items: FaqItem[];
};

export type FaqPageApi = {
  slug: string;
  title: string;
  description: string | null;
  keywords: string | null;
  content_format: "json_faq";
  categories: FaqCategory[];
  updated_at?: string;
};
