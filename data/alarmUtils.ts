import { mockIngredients, type Ingredient } from "@/data/dummydata";
import { getDaysLeft } from "@/utils/expiryHelpers";

export type AlarmType = "expiry_warning";

export type AlarmSection = "오늘" | "어제";

export type AlarmItem = {
  id: string;
  type: AlarmType;
  title: string;
  message: string;
  createdAtLabel: string;
  section: AlarmSection;
  isRead: boolean;
};

function buildExpiryWarningAlarm(ingredient: Ingredient): AlarmItem {
  return {
    id: `expiry-${ingredient.id}`,
    type: "expiry_warning",
    title: ingredient.name,
    message: `${ingredient.name} 예상 보관기한이 하루 뒤 끝납니다.`,
    createdAtLabel: "3분 전",
    section: "오늘",
    isRead: false,
  };
}

export function generateAlarmItems(): AlarmItem[] {
  return mockIngredients
    .filter((ingredient) => getDaysLeft(ingredient.purchaseDate, ingredient.category) === 1)
    .map(buildExpiryWarningAlarm);
}

export function groupAlarmItemsBySection(items: AlarmItem[]) {
  return {
    오늘: items.filter((item) => item.section === "오늘"),
    어제: items.filter((item) => item.section === "어제"),
  };
}