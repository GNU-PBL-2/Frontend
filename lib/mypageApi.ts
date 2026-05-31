import { getToken } from "@/utils/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function authHeaders(): Record<string, string> {
  const token = getToken();
  const base: Record<string, string> = { "Content-Type": "application/json" };
  if (token) base["Authorization"] = `Bearer ${token}`;
  return base;
}

export type UserPreferences = {
  allergies: string[];
  tastes: string[];
  categories: string[];
};

const CATEGORY_IDS: Record<string, number> = {
  한식: 1, 중식: 2, 일식: 3, 양식: 4, 동남아식: 5, 채식: 6, 분식: 7, 베이커리: 8,
};

const TASTE_IDS: Record<string, number> = {
  매운맛: 1, 단맛: 2, 짠맛: 3, 신맛: 4, 고소한맛: 5, 담백한맛: 6, 쓴맛: 7,
};

const ALLERGY_IDS: Record<string, number> = {
  "난류(달걀)": 1, 우유: 2, 메밀: 3, 땅콩: 4, "대두(콩)": 5, 밀: 6,
  고등어: 7, 게: 8, 새우: 9, 돼지고기: 10, 복숭아: 11, 토마토: 12,
  아황산류: 13, 호두: 14, 닭고기: 15, 쇠고기: 16, 오징어: 17,
  "조개류(굴,전복,홍합)": 18, 잣: 19, 아몬드: 20, 캐슈넛: 21, 참깨: 22,
};

const CATEGORY_ALIASES: Record<string, string> = {
  퓨전: "동남아식",
  디저트: "베이커리",
};

const TASTE_ALIASES: Record<string, string> = {
  맵게: "매운맛",
};

function toIds(
  names: string[],
  map: Record<string, number>,
  aliases: Record<string, string> = {}
): number[] {
  return names.flatMap((name) => {
    const resolved = aliases[name] ?? name;
    const id = map[resolved];
    if (id === undefined) {
      console.warn(`[mypageApi] 알 수 없는 레이블: "${name}"`);
      return [];
    }
    return [id];
  });
}

export async function updateUserPreferences(data: UserPreferences): Promise<void> {
  const body = {
    categories: toIds(data.categories, CATEGORY_IDS, CATEGORY_ALIASES),
    tastes: toIds(data.tastes, TASTE_IDS, TASTE_ALIASES),
    allergies: toIds(data.allergies, ALLERGY_IDS),
  };
  const res = await fetch(`${BASE_URL}/api/v1/users/onboard`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`설정 저장 실패: ${res.status}`);
}
