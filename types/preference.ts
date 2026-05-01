export type Allergy =
  | "난류(달걀)" | "우유" | "메밀" | "땅콩" | "대두(콩)"
  | "밀" | "고등어" | "게" | "새우" | "돼지고기"
  | "복숭아" | "토마토" | "아황산류" | "호두" | "닭고기"
  | "쇠고기" | "오징어" | "조개류" | "잣" | "아몬드"
  | "카사바" | "참깨";

export type FoodCategory =
  | "한식" | "중식" | "일식" | "양식"
  | "동남아시아" | "카레" | "분식" | "베이커리";

export type TastePreference =
  | "매운맛" | "단맛" | "짠맛" | "신맛"
  | "고소한맛" | "담백한맛" | "쓴맛";

export type UserPreference = {
  allergies: Allergy[];
  categories: FoodCategory[];
  tastes: TastePreference[];
};