import { SITEMAP_REVALIDATE_SEC } from "@/lib/sitemap-data";
import { buildRootIndexXml } from "@/lib/sitemap-build";
import { xmlResponse } from "@/lib/sitemap-xml";

export const revalidate = SITEMAP_REVALIDATE_SEC;

export async function GET() {
  const xml = await buildRootIndexXml();
  return xmlResponse(xml, SITEMAP_REVALIDATE_SEC);
}
