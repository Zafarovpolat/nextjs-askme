export type AboutPosterItem = {
  type: "poster";
  imageUrl: string;
  alt?: string;
};

export type AboutTextItem = {
  type: "text";
  title?: string;
  html: string;
};

export type AboutListItem = {
  type: "list";
  columns: 1 | 2;
  variant?: "plain" | "with_check";
  title?: string;
  items: string[];
};

export type AboutHintCard = {
  svg?: string;
  title?: string;
  description?: string;
};

export type AboutHintCardsItem = {
  type: "hint_cards";
  items: AboutHintCard[];
};

export type AboutRankRow = {
  presetIcon?: "" | "newbie" | "student";
  iconSvg?: string;
  iconImageUrl?: string;
  title?: string;
};

export type AboutRanksItem = {
  type: "ranks";
  items: AboutRankRow[];
};

export type AboutBlockItem =
  | AboutPosterItem
  | AboutTextItem
  | AboutListItem
  | AboutHintCardsItem
  | AboutRanksItem;

export type AboutBlock = {
  items: AboutBlockItem[];
};

export type AboutPageApi = {
  slug: string;
  title: string;
  description: string | null;
  keywords: string | null;
  content_format: "json_blocks";
  blocks: AboutBlock[];
  updated_at?: string;
};
