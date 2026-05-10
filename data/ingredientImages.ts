// 재료명(한국어) → 영어 검색 키워드 매핑
const INGREDIENT_KEYWORDS: Record<string, string> = {
  // 채소
  당근: "carrot",
  양파: "onion",
  감자: "potato",
  토마토: "tomato",
  오이: "cucumber",
  시금치: "spinach",
  마늘: "garlic",
  버섯: "mushroom",
  배추: "napa cabbage",
  무: "radish",
  대파: "green onion",
  파: "green onion",
  쪽파: "green onion",
  고추: "red chili pepper",
  청양고추: "green chili pepper",
  파프리카: "bell pepper",
  브로콜리: "broccoli",
  고구마: "sweet potato",
  호박: "pumpkin",
  애호박: "zucchini",
  가지: "eggplant",
  상추: "lettuce",
  깻잎: "perilla leaf",
  콩나물: "bean sprout",
  숙주: "bean sprout",
  연근: "lotus root",
  우엉: "burdock root",
  두부: "tofu",
  떡: "rice cake",
  옥수수: "corn",
  아보카도: "avocado",
  양배추: "cabbage",
  셀러리: "celery",
  아스파라거스: "asparagus",
  // 육류
  돼지고기: "pork meat raw",
  소고기: "beef meat raw",
  닭고기: "chicken raw",
  삼겹살: "pork belly",
  닭가슴살: "chicken breast",
  닭다리: "chicken leg",
  갈비: "beef ribs",
  등심: "sirloin steak",
  안심: "tenderloin beef",
  오리고기: "duck meat",
  양고기: "lamb meat",
  소시지: "sausage",
  베이컨: "bacon",
  햄: "ham",
  // 유제품
  계란: "egg",
  달걀: "egg",
  우유: "milk glass",
  치즈: "cheese",
  요거트: "yogurt",
  버터: "butter",
  생크림: "heavy cream",
  요구르트: "yogurt",
  아이스크림: "ice cream",
  // 해산물
  고등어: "mackerel fish",
  연어: "salmon fish",
  새우: "shrimp",
  오징어: "squid",
  낙지: "octopus",
  조개: "clam",
  참치: "tuna",
  꽃게: "crab",
  // 기타
  쌀: "rice grain",
  밀가루: "flour",
  소금: "salt",
  설탕: "sugar",
  간장: "soy sauce",
  된장: "miso paste",
  고추장: "gochujang",
  참기름: "sesame oil",
  식용유: "cooking oil",
  식초: "vinegar",
  올리브유: "olive oil",
  꿀: "honey",
  김치: "kimchi",
  라면: "ramen noodles",
  국수: "noodles",
  파스타: "pasta",
  빵: "bread",
  두유: "soy milk",
  어묵: "fish cake",
  김: "dried seaweed",
  미역: "seaweed",
};

// 카테고리 폴백 키워드
const CATEGORY_KEYWORDS: Record<string, string> = {
  채소: "fresh vegetables",
  육류: "raw meat",
  유제품: "dairy products",
  기타: "food ingredient",
};

// djb2 해시 — 같은 문자열은 항상 같은 lock 값 반환
function hashName(name: string): number {
  let h = 5381;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) >>> 0;
  }
  return (h % 90) + 1; // 1~90
}

export function getIngredientImageUrl(name: string, category: string): string {
  const keyword = INGREDIENT_KEYWORDS[name] ?? CATEGORY_KEYWORDS[category] ?? "food";
  const lock = hashName(name);
  return `https://loremflickr.com/120/120/${encodeURIComponent(keyword)}?lock=${lock}`;
}
