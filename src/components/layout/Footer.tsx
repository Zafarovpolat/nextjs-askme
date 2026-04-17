import Link from "next/link";
import {
  LEGAL_FOOTER_SLUGS,
  legalFooterHref,
} from "@/lib/legal-footer-slugs";

export default function Footer() {
  return (
    <footer>
      <div className="line container"></div>
      <div className="footer_wrapper container">
        <Link href="/">
          <img className="light_logo" src="/images/logo.svg" alt="AskMe" />
          <img className="dark_logo" src="/images/logo_dark.svg" alt="AskMe" />
        </Link>

        <Link href={legalFooterHref(LEGAL_FOOTER_SLUGS.userAgreement)}>
          Пользовательские соглашения
        </Link>
        <Link href={legalFooterHref(LEGAL_FOOTER_SLUGS.support)}>
          Служба поддержки
        </Link>
        <Link href={legalFooterHref(LEGAL_FOOTER_SLUGS.cookies)}>
          Файлы Cookie
        </Link>

        <p>Все права защищены © otvetai 2026</p>
      </div>
    </footer>
  );
}
