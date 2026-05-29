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
        <Link href="/" className="footer__logo">
          <div className="logo-container light_logo">
            <svg
              width="44"
              height="50"
              viewBox="0 0 44 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.8621 0C33.5553 0 44 9.4959 44 21.2097C44 29.661 39.9808 38.1356 21.931 50V42.2812C34.6207 29.2373 34.6207 26.1072 34.6207 19.6207C34.6207 13.1342 28.4061 7.87591 21.931 7.87591C15.456 7.87591 9.51724 13.1342 9.51724 19.6207C9.51724 26.061 15.3816 32.1379 21.7931 32.212V42.4188C10.1316 42.3816 0 32.9005 0 21.2097C0 9.4959 10.1689 0 21.8621 0Z"
                fill="#616AFF"
              />
            </svg>
            <span className="logo-text-otvet">Otvet</span>
            <span className="logo-text-ai">
              <span className="neon-letter neon-letter--a">a</span>
              <span className="neon-letter neon-letter--i">i</span>
            </span>
          </div>
          <div className="logo-container dark_logo">
            <svg
              width="44"
              height="50"
              viewBox="0 0 44 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.8621 0C33.5553 0 44 9.4959 44 21.2097C44 29.661 39.9808 38.1356 21.931 50V42.2812C34.6207 29.2373 34.6207 26.1072 34.6207 19.6207C34.6207 13.1342 28.4061 7.87591 21.931 7.87591C15.456 7.87591 9.51724 13.1342 9.51724 19.6207C9.51724 26.061 15.3816 32.1379 21.7931 32.212V42.4188C10.1316 42.3816 0 32.9005 0 21.2097C0 9.4959 10.1689 0 21.8621 0Z"
                fill="#616AFF"
              />
            </svg>
            <span className="logo-text-otvet logo-text-otvet--dark">Otvet</span>
            <span className="logo-text-ai">
              <span className="neon-letter neon-letter--a">a</span>
              <span className="neon-letter neon-letter--i">i</span>
            </span>
          </div>
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
