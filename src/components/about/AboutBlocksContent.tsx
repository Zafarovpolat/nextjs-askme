import AboutItemRenderer from "./AboutItemRenderer";
import type { AboutBlock } from "@/types/about-page";

export default function AboutBlocksContent({ blocks }: { blocks: AboutBlock[] }) {
  return (
    <>
      {blocks.map((block, bi) => (
        <section
          key={bi}
          className={`about-content-section ${bi % 2 === 1 ? "about-content-section--alt" : ""}`}
        >
          {(block.items ?? []).map((item, ii) => (
            <AboutItemRenderer key={ii} item={item} />
          ))}
        </section>
      ))}
    </>
  );
}
