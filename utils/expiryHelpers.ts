import type { Category } from "@/data/dummydata";

export const shelfLifeMap: Record<Category, number> = {
  채소: 7,
  육류: 5,
  유제품: 7,
  기타: 7,
};

export function getExpiryDate(purchaseDate: string, category: Category) {
  const date = new Date(purchaseDate);
  date.setDate(date.getDate() + shelfLifeMap[category]);
  return date;
}

export function getDaysLeft(purchaseDate: string, category: Category) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = getExpiryDate(purchaseDate, category);
  expiry.setHours(0, 0, 0, 0);

  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}