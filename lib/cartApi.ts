import { getToken } from "@/utils/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function authHeaders(): Record<string, string> {
  const token = getToken();
  const base: Record<string, string> = { "Content-Type": "application/json" };
  if (token) base["Authorization"] = `Bearer ${token}`;
  return base;
}

export type CartItem = {
  cartItemId: number;
  ingredientId: number | null;
  name: string;
  quantity: number;
  unit: string | null;
  isChecked: boolean;
};

export type CartItemAddPayload = {
  ingredientId?: number | null;
  name: string;
  quantity: number;
  unit?: string | null;
};

export async function fetchCartItems(): Promise<CartItem[]> {
  const res = await fetch(`${BASE_URL}/api/v1/carts/items`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`장바구니 조회 실패: ${res.status}`);
  return res.json();
}

export async function addCartItems(items: CartItemAddPayload[]): Promise<CartItem[]> {
  const res = await fetch(`${BASE_URL}/api/v1/carts/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`장바구니 추가 실패: ${res.status}`);
  return res.json();
}

export async function updateCartItem(
  cartItemId: number,
  patch: { quantity?: number; isChecked?: boolean }
): Promise<CartItem> {
  const res = await fetch(`${BASE_URL}/api/v1/carts/items/${cartItemId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`장바구니 수정 실패: ${res.status}`);
  return res.json();
}

export async function deleteCartItem(cartItemId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/carts/items/${cartItemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`장바구니 삭제 실패: ${res.status}`);
}

export async function deleteCartItems(cartItemIds: number[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/carts/items`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify(cartItemIds),
  });
  if (!res.ok) throw new Error(`장바구니 일괄 삭제 실패: ${res.status}`);
}
