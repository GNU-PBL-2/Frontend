import { Ingredient } from "@/types/ingredient";

const dateFromToday = (offsetDays: number) => {
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const mockIngredients: Ingredient[] = [
  {
    id: 1,
    name: "두부",
    category: "기타",
    purchaseDate: dateFromToday(0),
    expiryDate: dateFromToday(-2),
    quantityType: "number",
    quantityStatus: "보통",
    quantityValue: 2,
    favorite: false,
  },
  {
    id: 2,
    name: "시금치",
    category: "채소",
    purchaseDate: dateFromToday(-5),
    expiryDate: dateFromToday(30),
    quantityType: "status",
    quantityStatus: "적음",
    favorite: false,
  },
  {
    id: 3,
    name: "계란",
    category: "유제품",
    purchaseDate: dateFromToday(0),
    expiryDate: dateFromToday(1),
    quantityType: "number",
    quantityStatus: "보통",
    quantityValue: 5,
    favorite: false,
  },
  {
    id: 4,
    name: "양파",
    category: "채소",
    purchaseDate: dateFromToday(0),
    expiryDate: dateFromToday(0),
    quantityType: "number",
    quantityStatus: "많음",
    quantityValue: 3,
    favorite: false,
  },
  {
    id: 5,
    name: "우유",
    category: "유제품",
    purchaseDate: dateFromToday(0),
    expiryDate: dateFromToday(4),
    quantityType: "status",
    quantityStatus: "보통",
    favorite: false,
  },
  {
    id: 6,
    name: "소고기",
    category: "육류",
    purchaseDate: dateFromToday(0),
    expiryDate: dateFromToday(5),
    quantityType: "status",
    quantityStatus: "적음",
    favorite: true,
  },
  {
    id: 7,
    name: "당근",
    category: "채소",
    purchaseDate: dateFromToday(0),
    expiryDate: dateFromToday(3),
    quantityType: "number",
    quantityStatus: "보통",
    quantityValue: 2,
    favorite: false,
  },
];