export type Category = "채소" | "육류" | "유제품" | "기타";
export type CategoryFilter = "전체" | Category;

export type QuantityStatus = "적음" | "보통" | "많음";
export type QuantityType = "status" | "number";  // 시안의 상태형 / 수치형 토글

export type FridgeStatus = "NONE" | "ENOUGH" | "LOW" | "EXPIRING" | "EXPIRED"; // 백엔드 연동용

export type SortType = "유통기한순" | "구매일순" | "이름순";

export type Ingredient = {
  id: number;
  name: string;
  category: Category;
  purchaseDate: string;    // 'YYYY-MM-DD'
  expiryDate: string;      // 'YYYY-MM-DD' ← 추가! D-day 계산에 필요
  quantityType: QuantityType;
  quantityStatus: QuantityStatus;
  quantityValue?: number;  // quantityType이 'number'일 때만
  favorite: boolean;
  fridgeStatus?: FridgeStatus; // 백엔드 연동 후 채워질 필드
};

// 재료 추가 팝업 폼 전용 타입
export type IngredientFormData = Omit<Ingredient, "id" | "fridgeStatus">;