import { getToken } from "@/utils/auth";

const BASE_URL = "http://localhost:8080";

function authHeaders(): Record<string, string> {
  const token = getToken();
  const base: Record<string, string> = { "Content-Type": "application/json" };
  if (token) base["Authorization"] = `Bearer ${token}`;
  return base;
}

export type FridgeItem = {
  fridgeId: number;
  ingredientId: number;
  ingredientName: string;
  categoryName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

export type MasterIngredient = {
  ingredientId: number;
  name: string;
  categoryName: string;
};

export type FridgeForm = {
  selectedIngredientId: number | null;
  selectedIngredientName: string;
  selectedCategoryName: string;
  ingredientSearch: string;
  expiryDate: string;
  quantity: string;
  unit: string;
};

export const INITIAL_FRIDGE_FORM: FridgeForm = {
  selectedIngredientId: null,
  selectedIngredientName: "",
  selectedCategoryName: "",
  ingredientSearch: "",
  expiryDate: "",
  quantity: "1",
  unit: "개",
};

export async function fetchFridgeList(memberId: number): Promise<FridgeItem[]> {
  const res = await fetch(`${BASE_URL}/api/v1/fridge/${memberId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`냉장고 불러오기 실패: ${res.status}`);
  const data: Omit<FridgeItem, "categoryName">[] = await res.json();
  return data.map((item) => ({ ...item, categoryName: "" }));
}

export async function fetchMasterIngredients(): Promise<MasterIngredient[]> {
  const res = await fetch(`${BASE_URL}/api/v1/storage/ingredients`);
  if (!res.ok) throw new Error(`재료 목록 불러오기 실패: ${res.status}`);
  return res.json();
}

export async function createFridgeItem(data: {
  memberId: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  expiryDate: string;
}): Promise<FridgeItem> {
  const res = await fetch(`${BASE_URL}/api/v1/fridge`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`재료 추가 실패: ${res.status}`);
  const item: Omit<FridgeItem, "categoryName"> = await res.json();
  return { ...item, categoryName: "" };
}

export async function updateFridgeItem(
  fridgeId: number,
  data: { quantity: number; unit: string; expiryDate: string }
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/fridge/${fridgeId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`재료 수정 실패: ${res.status}`);
}

export async function deleteFridgeItem(fridgeId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/fridge/${fridgeId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`재료 삭제 실패: ${res.status}`);
}
