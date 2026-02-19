import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="line container"></div>
      <div className="footer_wrapper container">
        <Link href="/">
          <img className="light_logo" src="/images/logo.svg" alt="AskMe" />
          <img className="dark_logo" src="/images/logo_dark.svg" alt="AskMe" />
        </Link>
        
        <Link href="/user-agreement">Пользовательские соглашения</Link>
        <Link href="/support">Служба поддержки</Link>
        <Link href="/cookies">Файлы Cookie</Link>
        
        <p>Все права защищены © otvetai 2026</p>
      </div>
    </footer>
  )
}
