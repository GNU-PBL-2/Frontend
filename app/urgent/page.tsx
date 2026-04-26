import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { mockIngredients, type Category } from "@/data/dummydata";
import { getDaysLeft } from "@/utils/expiryHelpers";

function getIngredientEmoji(name: string, category: Category) {
  switch (name) {
    case "소고기":
      return "🥩";
    case "두부":
      return "◻️";
    case "계란":
      return "🥚";
    case "당근":
      return "🥕";
    case "양파":
      return "🧅";
    case "우유":
      return "🥛";
    case "시금치":
      return "🥬";
  }

  switch (category) {
    case "채소":
      return "🥬";
    case "육류":
      return "🥩";
    case "유제품":
      return "🥛";
    case "기타":
      return "🍽️";
    default:
      return "📦";
  }
}

function formatPurchaseDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 구매`;
}

export default function UrgentPage() {
  const urgentItems = mockIngredients
  .map((item) => {
    const daysLeft = getDaysLeft(item.expiryDate);
    return {
      ...item,
      daysLeft,
      dday: daysLeft < 0 ? `D+${Math.abs(daysLeft)}` : `D-${daysLeft}`,
    };
  })
  .filter((item) => item.daysLeft <= 3)
  .sort((a, b) => a.daysLeft - b.daysLeft);

  const getDdayBadgeClass = (daysLeft: number) => {
    if (daysLeft <= 1) return "bg-red-500 text-white";
    if (daysLeft <= 3) return "bg-orange-400 text-white";
    return "bg-gray-500 text-white";
  };

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen px-4 pt-8 pb-28">
        <div className="mb-10">
          <h1 className="text-xl font-extrabold tracking-tight text-gray-950">
            유통기한 <span className="text-red-500">임박 재료</span>
          </h1>
        </div>

        <div className="space-y-5">
          {urgentItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-md border border-gray-300 bg-white p-2.5 shadow-sm"
            >
              <div className="h-16 w-24 shrink-0 rounded-md border border-gray-300 bg-gray-50 flex items-center justify-center text-4xl">
                {getIngredientEmoji(item.name, item.category)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <p className="truncate text-base font-extrabold text-gray-950">
                    {item.name}
                  </p>
                  <p className="shrink-0 text-base font-extrabold text-gray-950">
                    {item.quantityValue !== undefined
                      ? `${item.quantityValue}개`
                      : item.quantityStatus}
                  </p>
                  <span
                    className={`ml-auto rounded-md px-2.5 py-1 text-sm font-bold leading-none ${getDdayBadgeClass(
                      item.daysLeft
                    )}`}
                  >
                    {item.dday}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {formatPurchaseDate(item.purchaseDate)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/recipe"
          className="mt-10 block w-full rounded-md border border-gray-300 bg-white py-3 text-center text-base font-bold text-gray-900 shadow-sm"
        >
          활용 가능한 레시피 확인하기
        </Link>

        <div className="h-5" />
      </div>

      <BottomNav />
    </div>
  );
}
