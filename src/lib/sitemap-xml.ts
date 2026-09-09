import {
  absUrl,
  isDisallowedPath,
  sitemapFileUrl,
  type SitemapUrlRow,
} from "@/lib/sitemap-data";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function sitemapIndexXml(files: string[], lastmod?: string): string {
  const stamp = lastmod ?? new Date().toISOString();
  const body = files
    .map(
      (file) => `  <sitemap>
    <loc>${xmlEscape(sitemapFileUrl(file))}</loc>
    <lastmod>${xmlEscape(stamp)}</lastmod>
  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

export function urlsetXml(
  rows: SitemapUrlRow[],
  extra?: { changefreq?: string; priority?: string },
): string {
  const body = rows
    .filter((row) => row.path && !isDisallowedPath(row.path))
    .map((row) => {
      const loc = absUrl(row.path);
      const lastmod = row.lastmod
        ? `\n    <lastmod>${xmlEscape(row.lastmod)}</lastmod>`
        : "";
      const changefreq = extra?.changefreq
        ? `\n    <changefreq>${xmlEscape(extra.changefreq)}</changefreq>`
        : "";
      const priority = extra?.priority
        ? `\n    <priority>${xmlEscape(extra.priority)}</priority>`
        : "";
      return `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod}${changefreq}${priority}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function xmlResponse(xml: string, revalidateSec: number): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${revalidateSec}, s-maxage=${revalidateSec}`,
    },
  });
}
