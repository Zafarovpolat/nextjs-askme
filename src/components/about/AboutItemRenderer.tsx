import { CheckIcon } from "@/components/AboutIcons";
import { NewbieIcon, StudentIcon } from "@/components/AboutRanks";
import type { AboutBlockItem } from "@/types/about-page";

function PosterBlock({ item }: { item: Extract<AboutBlockItem, { type: "poster" }> }) {
  if (!item.imageUrl) return null;
  return (
    <div className="about-section-banner-wrap">
      <img src={item.imageUrl} alt={item.alt ?? ""} className="about-section-banner" />
    </div>
  );
}

function TextBlock({ item }: { item: Extract<AboutBlockItem, { type: "text" }> }) {
  if (!item.title && !item.html) return null;
  return (
    <div className="about-section-body">
      {item.title ? <h2 className="about-subtitle" dangerouslySetInnerHTML={{ __html: item.title }} /> : null}
      {item.html ? <div dangerouslySetInnerHTML={{ __html: item.html }} /> : null}
    </div>
  );
}

function ListBlock({ item }: { item: Extract<AboutBlockItem, { type: "list" }> }) {
  const cols = item.columns === 2 ? 2 : 1;
  const rows = (item.items ?? []).filter((s) => String(s).trim() !== "");
  if (!rows.length && !item.title) return null;

  const renderLi = (line: string, key: string | number) => (
    <li key={key}>
      {item.variant === "with_check" ? (
        <>
          <CheckIcon /> <span dangerouslySetInnerHTML={{ __html: line }} />
        </>
      ) : (
        <span dangerouslySetInnerHTML={{ __html: line }} />
      )}
    </li>
  );

  if (cols === 2) {
    const mid = Math.ceil(rows.length / 2);
    const left = rows.slice(0, mid);
    const right = rows.slice(mid);
    return (
      <div className="about-section-body">
        {item.title ? <h2 className="about-subtitle" dangerouslySetInnerHTML={{ __html: item.title }} /> : null}
        <div className="about-points-grid">
          <ul className="about-list" style={{ marginBottom: 0 }}>
            {left.map((line, i) => renderLi(line, `l-${i}`))}
          </ul>
          <ul className="about-list" style={{ marginBottom: 0 }}>
            {right.map((line, i) => renderLi(line, `r-${i}`))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="about-section-body">
      {item.title ? <h2 className="about-subtitle" dangerouslySetInnerHTML={{ __html: item.title }} /> : null}
      <ul className="about-list">{rows.map((line, i) => renderLi(line, i))}</ul>
    </div>
  );
}

function HintCardsBlock({ item }: { item: Extract<AboutBlockItem, { type: "hint_cards" }> }) {
  const cards = (item.items ?? []).slice(0, 3);
  if (!cards.length) return null;
  return (
    <div className="about-section-body">
      <div className="about-cards">
        {cards.map((card, i) => (
          <div key={i} className="about-card">
            {card.svg ? (
              <div className="about-card-icon" dangerouslySetInnerHTML={{ __html: card.svg }} />
            ) : null}
            {card.title ? <div className="about-card-title" dangerouslySetInnerHTML={{ __html: card.title }} /> : null}
            {card.description ? (
              <p className="about-card-text" dangerouslySetInnerHTML={{ __html: card.description }} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function RanksBlock({ item }: { item: Extract<AboutBlockItem, { type: "ranks" }> }) {
  const rows = item.items ?? [];
  if (!rows.length) return null;
  return (
    <div className="about-section-body">
      <div className="about-ranks">
        {rows.map((rank, i) => (
          <div key={i} className="about-rank-item">
            <div className="about-rank-icon">
              {rank.presetIcon === "newbie" ? (
                <NewbieIcon />
              ) : rank.presetIcon === "student" ? (
                <StudentIcon />
              ) : rank.iconImageUrl ? (
                <img src={rank.iconImageUrl} alt={rank.title ?? ""} />
              ) : rank.iconSvg ? (
                <span dangerouslySetInnerHTML={{ __html: rank.iconSvg }} />
              ) : null}
            </div>
            {rank.title ? <div className="about-rank-title">{rank.title}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutItemRenderer({ item }: { item: AboutBlockItem }) {
  switch (item.type) {
    case "poster":
      return <PosterBlock item={item} />;
    case "text":
      return <TextBlock item={item} />;
    case "list":
      return <ListBlock item={item} />;
    case "hint_cards":
      return <HintCardsBlock item={item} />;
    case "ranks":
      return <RanksBlock item={item} />;
    default:
      return null;
  }
}
