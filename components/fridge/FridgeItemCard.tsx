"use client";

import { getDaysLeft } from "@/utils/expiryHelpers";

type Category = "채소" | "육류" | "유제품" | "기타";
type Quantity = "적음" | "보통" | "많음";

type Ingredient = {
  id: number;
  name: string;
  category: Category;
  purchaseDate: string;
  quantity: Quantity;
  quantityValue?: number;
  favorite: boolean;
};

type FridgeItemCardProps = {
  item: Ingredient;
  onToggleFavorite: (id: number) => void;
};

const quantityTextColor: Record<Quantity, string> = {
  적음: "text-red-500",
  보통: "text-orange-400",
  많음: "text-green-600",
};

function formatDateKorean(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}년 ${month}월 ${day}일`;
}

function getDaysLeftText(daysLeft: number) {
  if (daysLeft < 0) return `${Math.abs(daysLeft)}일 지남`;
  if (daysLeft === 0) return "오늘까지";
  return `${daysLeft}일 남음`;
}

function getCategoryEmoji(category: Category) {
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

export default function FridgeItemCard({
  item,
  onToggleFavorite,
}: FridgeItemCardProps) {
  const daysLeft = getDaysLeft(item.purchaseDate, item.category);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex gap-3">
      <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-3xl shrink-0">
        {getCategoryEmoji(item.category)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-gray-900 truncate">{item.name}</p>
            <p className={`text-sm font-semibold ${quantityTextColor[item.quantity]}`}>
              {item.quantityValue ? `${item.quantityValue}개` : item.quantity}
            </p>
          </div>

          <button
            onClick={() => onToggleFavorite(item.id)}
            className="w-8 h-8 flex items-center justify-center text-lg shrink-0"
            aria-label="즐겨찾기"
          >
            {item.favorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="mt-2 text-sm text-gray-500 leading-6">
          <p>최근 구매 {formatDateKorean(item.purchaseDate)}</p>
          <p className={daysLeft <= 2 ? "text-red-500 font-semibold" : ""}>
            유통기한 {getDaysLeftText(daysLeft)}
          </p>
        </div>
      </div>
    </div>
  );
}