export type CustomHtmlPageApi = {
  slug: string;
  title: string;
  description: string | null;
  keywords: string | null;
  content_format: "html";
  content: string;
  version?: {
    version: number;
    created_at: string | null;
  } | null;
  updated_at?: string;
};
