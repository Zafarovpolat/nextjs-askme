import Link from "next/link";
import {
  LEGAL_FOOTER_LINKS,
  legalFooterHref,
} from "@/lib/legal-footer-slugs";
import LogoWordmark from "./LogoWordmark";

export default function Footer() {
  return (
    <footer>
      <div className="line container"></div>
      <div className="footer_wrapper container">
        <Link href="/" className="footer__logo">
          <div className="logo-container light_logo">
            <LogoWordmark />
          </div>
          <div className="logo-container dark_logo">
            <LogoWordmark />
          </div>
        </Link>

        {LEGAL_FOOTER_LINKS.map(({ slug, label }) => (
          <Link key={slug} href={legalFooterHref(slug)}>
            {label}
          </Link>
        ))}

        <p>Все права защищены © otvetai 2026</p>
      </div>
    </footer>
  );
}
