"use client";

type Palette = { bright: string; deep: string; ink: string };

const PALETTES: { keywords: string[]; palette: Palette }[] = [
  {
    keywords: ["계란", "달걀", "볶음밥", "오믈렛", "에그"],
    palette: { bright: "#F6D98A", deep: "#EFC65E", ink: "#8A6512" },
  },
  {
    keywords: ["김밥", "롤", "초밥", "스시"],
    palette: { bright: "#9DBE7E", deep: "#7CA85F", ink: "#3F5A2B" },
  },
  {
    keywords: ["김치"],
    palette: { bright: "#E7A074", deep: "#DC7E4C", ink: "#8A451F" },
  },
  {
    keywords: ["호박", "파전", "부침", "빈대"],
    palette: { bright: "#CFD68A", deep: "#B6C264", ink: "#5A6420" },
  },
  {
    keywords: ["두부", "순두부"],
    palette: { bright: "#EBE2C6", deep: "#DCD0A6", ink: "#7A6E42" },
  },
  {
    keywords: ["국", "찌개", "탕", "해장", "된장", "미역", "부대", "설렁", "갈비"],
    palette: { bright: "#E9B98A", deep: "#DD9A5C", ink: "#82511F" },
  },
];

const DEFAULT_PALETTE: Palette = { bright: "#E9B98A", deep: "#DD9A5C", ink: "#82511F" };

function getPalette(title: string): Palette {
  for (const { keywords, palette } of PALETTES) {
    if (keywords.some((kw) => title.includes(kw))) return palette;
  }
  return DEFAULT_PALETTE;
}

export default function RecipePlaceholder({ title }: { title: string }) {
  const { bright, deep, ink } = getPalette(title);

  return (
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(140deg, ${bright}, ${deep})` }}
    >
      {/* 미세 대각 스트라이프 텍스처 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,.16) 0 2px, transparent 2px 11px)",
          opacity: 0.5,
        }}
      />

      {/* 접시 아이콘 + 라벨 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" style={{ opacity: 0.55 }}>
          <circle cx="15" cy="15" r="12" stroke={ink} strokeWidth="1.5" />
          <circle cx="15" cy="15" r="5"  stroke={ink} strokeWidth="1.2" />
          <circle cx="15" cy="15" r="1.8" fill={ink} />
        </svg>
        <span
          style={{
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            fontSize: "9.5px",
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: 0.7,
            color: ink,
            lineHeight: 1,
            display: "block",
            maxWidth: "68px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {title || "음식 사진"}
        </span>
      </div>
    </div>
  );
}
