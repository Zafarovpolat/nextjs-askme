import Link from "next/link";

type CategorySubjectIconProps = {
  name: string;
  slug: string;
  iconKey?: string | null;
  fallbackIconKey?: string;
};

/** Круглая иконка категории в карточке — с подсказкой и ссылкой на раздел */
export default function CategorySubjectIcon({
  name,
  slug,
  iconKey,
  fallbackIconKey = "gaming",
}: CategorySubjectIconProps) {
  const resolvedKey = iconKey ?? fallbackIconKey ?? null;

  return (
    <Link
      href={`/categories/${slug}`}
      className="subject_item_icon"
      title={name}
      aria-label={name}
    >
      {resolvedKey ? (
        <svg width="24" height="24" className="category_icon" aria-hidden>
          <use xlinkHref={`#${resolvedKey}`} />
        </svg>
      ) : (
        <span className="category_icon_placeholder" aria-hidden />
      )}
    </Link>
  );
}
