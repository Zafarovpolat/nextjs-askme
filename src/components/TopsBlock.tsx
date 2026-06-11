import Link from "next/link";
import MostDiscussedListItem, {
  type MostDiscussedQuestion,
} from "@/components/MostDiscussedListItem";
import PopularTopicListItem, {
  type PopularTopicItem,
} from "@/components/PopularTopicListItem";
import { formatCompactNumWord } from "@/lib/format-compact-count";

export type ProjectLeaderItem = {
  id: number;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  balls?: number;
};

export type TopsBlockData = {
  project_leaders?: ProjectLeaderItem[];
  most_discussed?: MostDiscussedQuestion[];
  popular_topics?: PopularTopicItem[];
};

const numWord = (value: number, words: [string, string, string]): string =>
  formatCompactNumWord(value, words);

export default function TopsBlock({ data }: { data: TopsBlockData }) {
  return (
    <div className="tops_block">
      <div className="tops_block_item">
        <div className="blocks_title">
          <h2>Лидеры проекта</h2>
        </div>
        <div className="tops_block_item_top_subjects">
          {(data.project_leaders ?? []).map((u) => (
            <Link
              href={`/profile/${u.id}`}
              key={u.id}
              className="question_list_item"
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            >
              <div className="question_list_item_left">
                <img
                  src={u.avatar_url || "/images/icons/avatar.svg"}
                  alt={u.first_name}
                />
                <div className="question_list_item_left__user_meta">
                  <div
                    className="main_text"
                    title={`${u.first_name} ${u.last_name}`.trim()}
                  >
                    {u.first_name} {u.last_name}
                  </div>
                  <span>
                    {numWord(u.balls ?? 0, ["балл", "балла", "баллов"])}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="tops_block_item">
        <div className="blocks_title">
          <h2>Самые обсуждаемые</h2>
        </div>
        <div className="tops_block_item_top_subjects">
          {(data.most_discussed ?? []).map((q) => (
            <MostDiscussedListItem key={q.id} question={q} />
          ))}
        </div>
      </div>

      <div className="tops_block_item">
        <div className="blocks_title">
          <h2>Популярные темы</h2>
        </div>
        <div className="tops_block_item_top_subjects">
          {(data.popular_topics ?? []).map((topic) => (
            <PopularTopicListItem key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}
