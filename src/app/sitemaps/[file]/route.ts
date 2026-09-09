import { SITEMAP_REVALIDATE_SEC } from "@/lib/sitemap-data";
import {
  buildSystemUrlset,
  buildTypeIndexOrUrlset,
  buildTypePage,
} from "@/lib/sitemap-build";
import { xmlResponse } from "@/lib/sitemap-xml";

export const revalidate = SITEMAP_REVALIDATE_SEC;

const FILE_RE =
  /^(system|categories|questions|profiles)(?:-([1-9]\d*))?\.xml$/;

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> | { file: string } },
) {
  const { file } = await Promise.resolve(context.params);
  const match = FILE_RE.exec(file ?? "");
  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  const kind = match[1] as
    | "system"
    | "categories"
    | "questions"
    | "profiles";
  const pageRaw = match[2];

  let xml: string;
  if (kind === "system") {
    if (pageRaw) {
      return new Response("Not found", { status: 404 });
    }
    xml = await buildSystemUrlset();
  } else if (pageRaw) {
    xml = await buildTypePage(kind, Number(pageRaw));
  } else {
    xml = await buildTypeIndexOrUrlset(kind);
  }

  return xmlResponse(xml, SITEMAP_REVALIDATE_SEC);
}
