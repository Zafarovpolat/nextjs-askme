export type CustomHtmlPageApi = {
  slug: string;
  title: string;
  description: string | null;
  keywords: string | null;
  content_format: "html";
  content: string;
  updated_at?: string;
};
