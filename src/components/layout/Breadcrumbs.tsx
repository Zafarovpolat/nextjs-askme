import Link from "next/link";
import { absolutePageUrl } from "@/lib/page-seo";

export type BreadcrumbCrumb = {
  name: string;
  /** Путь сайта (`/categories`) или абсолютный URL. У текущего пункта — URL этой страницы. */
  href?: string;
};

function toAbsoluteHref(href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  return absolutePageUrl(href);
}

export default function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbCrumb[];
  className?: string;
}) {
  const visible = items.filter((item) => item.name.trim());
  if (visible.length === 0) return null;

  const navClass = className ? `breadcrumbs ${className}` : "breadcrumbs";

  return (
    <nav
      aria-label="Хлебные крошки"
      className={navClass}
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      {visible.map((item, index) => {
        const position = index + 1;
        const isLast = index === visible.length - 1;
        const abs = item.href ? toAbsoluteHref(item.href) : undefined;

        return (
          <span
            key={`${position}-${item.name}`}
            className="breadcrumbs__node"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {isLast ? (
              <span
                itemProp="item"
                itemScope
                itemType="https://schema.org/WebPage"
                itemID={abs}
              >
                <span className="breadcrumbs__current" itemProp="name">
                  {item.name}
                </span>
              </span>
            ) : abs ? (
              <Link href={item.href!} className="breadcrumbs__link" itemProp="item">
                <span itemProp="name">{item.name}</span>
              </Link>
            ) : (
              <span className="breadcrumbs__current" itemProp="name">
                {item.name}
              </span>
            )}
            <meta itemProp="position" content={String(position)} />
            {!isLast ? (
              <span className="breadcrumbs__sep" aria-hidden>
                •
              </span>
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
