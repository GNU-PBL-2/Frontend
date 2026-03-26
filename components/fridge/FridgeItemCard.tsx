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
  isEditMode: boolean;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
};

function formatDateKorean(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}년 ${month}월 ${day}일`;
}

function getDdayText(daysLeft: number) {
  if (daysLeft < 0) return `D+${Math.abs(daysLeft)}`;
  if (daysLeft === 0) return "D-day";
  return `D-${daysLeft}`;
}

function getDdayPillClass(daysLeft: number) {
  if (daysLeft <= 7) return "bg-red-500 text-white";
  return "bg-green-500 text-white";
}

function getQuantityLevel(quantity: Quantity) {
  switch (quantity) {
    case "적음":
      return 1;
    case "보통":
      return 2;
    case "많음":
      return 3;
    default:
      return 1;
  }
}

function getQuantityColor(quantity: Quantity) {
  switch (quantity) {
    case "적음":
      return "bg-red-400 text-red-400";
    case "보통":
      return "bg-green-400 text-green-400";
    case "많음":
      return "bg-green-700 text-green-700";
    default:
      return "bg-gray-300 text-gray-400";
  }
}

export default function FridgeItemCard({
  item,
  onToggleFavorite,
  isEditMode,
  onIncrease,
  onDecrease,
}: FridgeItemCardProps) {

  const daysLeft = getDaysLeft(item.purchaseDate, item.category);
  const quantityLevel = item.quantityValue !== undefined ? 2 : getQuantityLevel(item.quantity);
  const quantityColor = item.quantityValue !== undefined ? "bg-gray-200 text-green-400" : getQuantityColor(item.quantity);
  const quantityLabel = item.quantityValue ? `${item.quantityValue}개` : item.quantity;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{item.name}</p>

          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((bar) => (
                <div
                  key={bar}
                  className={`h-1.5 w-7 rounded-full ${
                    bar <= quantityLevel ? quantityColor.split(" ")[0] : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-semibold ${quantityColor.split(" ")[1]}`}>
              {quantityLabel}
            </span>
          </div>

          <p className="mt-4 text-sm text-gray-300">
            최근 구매&nbsp;&nbsp;{formatDateKorean(item.purchaseDate)}
          </p>
        </div>

        {isEditMode ? (
          <div className="flex flex-col items-center gap-2 shrink-0">
            <button
              onClick={() => onIncrease(item.id)}
              className="w-10 h-10 rounded-md bg-green-600 text-white text-2xl flex items-center justify-center leading-none"
              aria-label="수량 증가"
            >
              +
            </button>

            <button
              onClick={() => onDecrease(item.id)}
              className="w-10 h-10 rounded-md bg-red-500 text-white text-2xl flex items-center justify-center leading-none"
              aria-label="수량 감소"
            >
              -
            </button>
          </div>
        ) : (
          <div
            className={`min-w-[58px] h-8 px-3 rounded-xl text-base font-bold flex items-center justify-center shrink-0 ${getDdayPillClass(
              daysLeft
            )}`}
          >
            {getDdayText(daysLeft)}
          </div>
        )}
      </div>
    </div>
  );
}