import Link from "next/link";
import {
  LEGAL_FOOTER_LINKS,
  legalFooterHref,
} from "@/lib/legal-footer-slugs";
import LogoWordmark from "./LogoWordmark";
import { HOME_LOGO_LABEL } from "@/lib/a11y-labels";

export default function Footer() {
  return (
    <footer>
      <div className="line container"></div>
      <div className="footer_wrapper container">
        <div className="footer__brand">
          <Link href="/" className="footer__logo" aria-label={HOME_LOGO_LABEL} title="Главная">
            <div className="logo-container light_logo">
              <LogoWordmark />
            </div>
            <div className="logo-container dark_logo">
              <LogoWordmark />
            </div>
          </Link>
          <p className="footer__copy">Все права защищены © otvetai 2026</p>
        </div>

        <nav className="footer__legal" aria-labelledby="footer-legal-heading">
          <p id="footer-legal-heading" className="footer__legal-heading">
            Документы
          </p>
          <ul className="footer__legal-list">
            {LEGAL_FOOTER_LINKS.map(({ slug, label }) => (
              <li key={slug}>
                <Link href={legalFooterHref(slug)}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
