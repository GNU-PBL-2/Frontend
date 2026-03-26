export type Category = "채소" | "육류" | "유제품" | "기타";
export type Quantity = "적음" | "보통" | "많음";

export type Ingredient = {
  id: number;
  name: string;
  category: Category;
  purchaseDate: string;
  quantity: Quantity;
  quantityValue?: number;
  favorite: boolean;
};

export const mockIngredients: Ingredient[] = [
  {
    id: 1,
    name: "두부",
    category: "기타",
    purchaseDate: "2026-03-21",
    quantity: "보통",
    quantityValue: 2,
    favorite: false,
  },
  {
    id: 2,
    name: "시금치",
    category: "채소",
    purchaseDate: "2026-03-23",
    quantity: "적음",
    favorite: false,
  },
  {
    id: 3,
    name: "계란",
    category: "유제품",
    purchaseDate: "2026-03-21",
    quantity: "보통",
    quantityValue: 5,
    favorite: false,
  },
  {
    id: 4,
    name: "양파",
    category: "채소",
    purchaseDate: "2026-03-22",
    quantity: "많음",
    quantityValue: 3,
    favorite: false,
  },
  {
    id: 5,
    name: "우유",
    category: "유제품",
    purchaseDate: "2026-03-22",
    quantity: "적음",
    favorite: false,
  },
  {
    id: 6,
    name: "소고기",
    category: "육류",
    purchaseDate: "2026-03-22",
    quantity: "적음",
    favorite: true,
  },
  {
    id: 7,
    name: "당근",
    category: "채소",
    purchaseDate: "2026-03-21",
    quantity: "보통",
    quantityValue: 2,
    favorite: false,
  },
];