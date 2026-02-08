'use client'

// Обертка для отображения модалки inline (без fixed позиционирования)
function ModalPreview({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="modal-preview">
      <h3 className="modal-preview__title">{title}</h3>
      <div className="modal-preview__container">
        {children}
      </div>
    </div>
  )
}

// Компоненты модалок для inline-отображения (без оверлея и fixed)
function LoginModalInline() {
  return (
    <div className="modal modal--small modal--inline" id="preview__login">
      <button className="modal__close" onClick={() => {}}>
        <svg width="16" height="16">
          <use xlinkHref="#close"></use>
        </svg>
      </button>
      <div className="modal__content">
        <div className="login-form__title">
          Упс вам нужно войти в аккаунт
        </div>
        <form
          className="login_block_content login_form"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="login_input login_input_icon">
            <svg className="login_input_svg" width="13" height="14">
              <use xlinkHref="#login-user"></use>
            </svg>
            <input type="text" name="login" placeholder="Ваш логин" />
          </div>
          <div className="login_input login_input_icon">
            <svg className="login_input_svg" width="11" height="14">
              <use xlinkHref="#login-lock"></use>
            </svg>
            <input type="password" name="password" placeholder="Ваш пароль" />
          </div>
          <div className="login_content_actions">
            <button className="m_btn category_btn" type="button">
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function QuestionModalInline() {
  return (
    <div className="modal modal--medium modal--inline" id="preview__question">
      <button className="modal__close" onClick={() => {}}>
        <svg width="16" height="16">
          <use xlinkHref="#close"></use>
        </svg>
      </button>
      <div className="modal__content">
        <div className="modal__image">
          <img src="/images/question.png" alt="" />
        </div>
        <p className="modal__description">
          Для публикации вопроса мы предложим вам зарегистрироваться на Ответах. Так вы не пропустите ни одного ответа на вопрос.
        </p>
      </div>
    </div>
  )
}

function TipsModalInline() {
  return (
    <div className="modal modal--medium modal--inline" id="preview__tips">
      <button className="modal__close" onClick={() => {}}>
        <svg width="16" height="16">
          <use xlinkHref="#close"></use>
        </svg>
      </button>
      <div className="modal__content">
        <div className="modal__image">
          <img src="/images/tips.png" alt="" />
        </div>
        <p className="modal__title">Советы</p>
        <p className="modal__info">
          Фразы &quot;Есть вопрос&quot;, &quot;Нужна помощь&quot;, &quot;Смотри внутри&quot; и&nbsp;т.&nbsp;д. лишь занимают полезное место.
        </p>
        <p className="modal__info">
          Старайтесь формулировать вопросы максимально четко и понятно. Чем понятнее будет ваш вопрос, &nbsp;тем более конкретные ответы вы получите.
        </p>
      </div>
    </div>
  )
}

function ComplaintModalInline() {
  return (
    <div className="login_block" id="preview__complaint">
      <svg className="login_block_bg" viewBox="0 0 457 353.5" style={{ width: '100%', height: 'auto' }}>
        <use xlinkHref="#login-bg"></use>
      </svg>

      <svg className="login_block_rect" width="124.601562" height="52">
        <use xlinkHref="#main-rect"></use>
      </svg>

      <div className="login_block_title">
        <h2>Пожаловаться</h2>
      </div>

      <form
        className="login_block_content"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="login_input">
          <select className="super-select" defaultValue="">
            <option value="" disabled>Выберите причину</option>
            <option value="spam">Спам</option>
            <option value="offensive">Оскорбление</option>
            <option value="inappropriate">Неприемлемый контент</option>
            <option value="other">Другое</option>
          </select>
        </div>
        <div className="login_input">
          <textarea
            className="complaint-textarea"
            placeholder="Опишите проблему"
            rows={5}
          ></textarea>
        </div>
        <div className="login_content_actions">
          <button className="m_btn category_btn" type="button">
            Отправить
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ModalsPage() {
  return (
    <div className="modals-page">
      <style>{`
        .modals-page {
          padding: 40px 20px;
          background: #f5f5fa;
          min-height: 100vh;
        }
        .modals-page h1 {
          text-align: center;
          font-family: Nunito;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 40px;
          color: #1F2A3B;
        }
        .modals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .modal-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .modal-preview__title {
          font-family: Nunito;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #6069FF;
        }
        .modal-preview__container {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        /* Переопределение стилей для inline-отображения модалок */
        .modal--inline {
          position: relative !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
          z-index: 1 !important;
          margin: 0 !important;
          transform: none !important;
          opacity: 1 !important;
          pointer-events: all !important;
        }
        @media screen and (max-width: 900px) {
          .modals-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h1>Все модалки</h1>

      <div className="modals-grid">
        <ModalPreview title="1. Логин">
          <LoginModalInline />
        </ModalPreview>

        <ModalPreview title="2. Вопрос">
          <QuestionModalInline />
        </ModalPreview>

        <ModalPreview title="3. Советы">
          <TipsModalInline />
        </ModalPreview>

        <ModalPreview title="4. Пожаловаться">
          <ComplaintModalInline />
        </ModalPreview>
      </div>
    </div>
  )
}
