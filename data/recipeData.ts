import { Recipe } from "@/types/recipe";
import { Ingredient } from "@/types/ingredient";
import { calcIngredientFridgeStatus } from "@/utils/recipeHelpers";



// 임박 재료(EXPIRING) 사용 개수 계산
// export function getExpiringCount(recipe: Recipe): number {
//   return recipe.ingredients.filter(
//     (ing) => ing.fridgeStatus === "EXPIRING"
//   ).length;
// }

// // 냉장고 재료로 바로 조리 가능한지 판단
// // NONE인 재료가 없고 isSubstitutable이 아닌 재료가 모두 있어야 함
// export function getIsCookable(recipe: Recipe): boolean {
//   return recipe.ingredients
//     .filter((ing) => !ing.isSubstitutable)
//     .every((ing) => ing.fridgeStatus !== "NONE" && ing.fridgeStatus !== "EXPIRED");
// }

export function getExpiringCount(
  recipe: Recipe,
  fridgeItems?: Ingredient[]
): number {
  const ingredients = fridgeItems
    ? calcIngredientFridgeStatus(recipe.ingredients, fridgeItems)
    : recipe.ingredients;

  return ingredients.filter((ing) => ing.fridgeStatus === "EXPIRING").length;
}

// 연동된 재료 기준 조리 가능 여부 계산
export function getIsCookable(
  recipe: Recipe,
  fridgeItems?: Ingredient[]
): boolean {
  const ingredients = fridgeItems
    ? calcIngredientFridgeStatus(recipe.ingredients, fridgeItems)
    : recipe.ingredients;

  return ingredients
    .filter((ing) => !ing.isSubstitutable)
    .every(
      (ing) => ing.fridgeStatus !== "NONE"
    );
}

export const mockRecipes: Recipe[] = [
  {
    id: 1,
    title: "시금치 된장국",
    thumbnailUrl: "https://picsum.photos/seed/spinach/400/300",
    categoryName: "한식",
    cookTimeMin: 15,
    youtubeUrl: "https://www.youtube.com/watch?v=example1",
    favorite: true,
    ingredients: [
      {
        ingredientId: 1,
        name: "시금치",
        amount: "100",
        unit: "g",
        isSubstitutable: false,
        fridgeStatus: "EXPIRING", // 임박 재료
      },
      {
        ingredientId: 2,
        name: "된장",
        amount: "2",
        unit: "큰술",
        isSubstitutable: false,
        fridgeStatus: "ENOUGH",
      },
      {
        ingredientId: 3,
        name: "두부",
        amount: "100",
        unit: "g",
        isSubstitutable: true,
        fridgeStatus: "ENOUGH",
      },
      {
        ingredientId: 4,
        name: "대파",
        amount: "1",
        unit: "대",
        isSubstitutable: true,
        fridgeStatus: "NONE",
      },
    ],
    steps: [
      { stepOrder: 1, content: "시금치를 깨끗이 씻어 먹기 좋은 크기로 자른다." },
      { stepOrder: 2, content: "냄비에 물을 붓고 된장을 풀어 끓인다." },
      { stepOrder: 3, content: "두부를 깍둑썰기 해서 넣는다." },
      { stepOrder: 4, content: "시금치와 대파를 넣고 한소끔 더 끓인다." },
    ],
  },
  {
    id: 2,
    title: "계란 볶음밥",
    thumbnailUrl: "https://picsum.photos/seed/eggrice/400/300",
    categoryName: "한식",
    cookTimeMin: 10,
    youtubeUrl: "https://www.youtube.com/watch?v=example2",
    favorite: false,
    ingredients: [
      {
        ingredientId: 5,
        name: "계란",
        amount: "2",
        unit: "개",
        isSubstitutable: false,
        fridgeStatus: "EXPIRING", // 임박 재료
      },
      {
        ingredientId: 6,
        name: "밥",
        amount: "1",
        unit: "공기",
        isSubstitutable: false,
        fridgeStatus: "ENOUGH",
      },
      {
        ingredientId: 7,
        name: "대파",
        amount: "약간",
        unit: "",
        isSubstitutable: true,
        fridgeStatus: "EXPIRING", // 임박 재료
      },
      {
        ingredientId: 8,
        name: "간장",
        amount: "1",
        unit: "큰술",
        isSubstitutable: false,
        fridgeStatus: "ENOUGH",
      },
    ],
    steps: [
      { stepOrder: 1, content: "대파를 송송 썰어 준비한다." },
      { stepOrder: 2, content: "팬에 기름을 두르고 대파를 볶는다." },
      { stepOrder: 3, content: "계란을 풀어 넣고 스크램블한다." },
      { stepOrder: 4, content: "밥을 넣고 간장으로 간하여 볶는다." },
    ],
  },
  {
    id: 3,
    title: "소고기 무국",
    thumbnailUrl: "https://picsum.photos/seed/beefradish/400/300",
    categoryName: "한식",
    cookTimeMin: 30,
    youtubeUrl: "https://www.youtube.com/watch?v=example3",
    favorite: true,
    ingredients: [
      {
        ingredientId: 9,
        name: "소고기",
        amount: "150",
        unit: "g",
        isSubstitutable: false,
        fridgeStatus: "EXPIRING", // 임박 재료
      },
      {
        ingredientId: 10,
        name: "무",
        amount: "200",
        unit: "g",
        isSubstitutable: false,
        fridgeStatus: "ENOUGH",
      },
      {
        ingredientId: 11,
        name: "국간장",
        amount: "2",
        unit: "큰술",
        isSubstitutable: false,
        fridgeStatus: "NONE", // 냉장고에 없음
      },
      {
        ingredientId: 12,
        name: "참기름",
        amount: "1",
        unit: "큰술",
        isSubstitutable: false,
        fridgeStatus: "NONE", // 냉장고에 없음
      },
    ],
    steps: [
      { stepOrder: 1, content: "소고기를 먹기 좋은 크기로 썰어 참기름에 볶는다." },
      { stepOrder: 2, content: "무를 나박썰기 해서 함께 볶는다." },
      { stepOrder: 3, content: "물을 붓고 국간장으로 간한 뒤 끓인다." },
      { stepOrder: 4, content: "무가 투명해질 때까지 중불에서 끓인다." },
    ],
  },
  {
    id: 4,
    title: "토마토 파스타",
    thumbnailUrl: "https://picsum.photos/seed/pasta/400/300",
    categoryName: "양식",
    cookTimeMin: 25,
    youtubeUrl: "https://www.youtube.com/watch?v=example4",
    favorite: false,
    ingredients: [
      {
        ingredientId: 13,
        name: "파스타면",
        amount: "100",
        unit: "g",
        isSubstitutable: false,
        fridgeStatus: "ENOUGH",
      },
      {
        ingredientId: 14,
        name: "토마토",
        amount: "2",
        unit: "개",
        isSubstitutable: false,
        fridgeStatus: "EXPIRING", // 임박 재료
      },
      {
        ingredientId: 15,
        name: "양파",
        amount: "0.5",
        unit: "개",
        isSubstitutable: true,
        fridgeStatus: "ENOUGH",
      },
      {
        ingredientId: 16,
        name: "마늘",
        amount: "3",
        unit: "쪽",
        isSubstitutable: false,
        fridgeStatus: "NONE", // 냉장고에 없음
      },
    ],
    steps: [
      { stepOrder: 1, content: "파스타면을 소금물에 삶는다." },
      { stepOrder: 2, content: "마늘과 양파를 올리브오일에 볶는다." },
      { stepOrder: 3, content: "토마토를 으깨 넣고 소스를 만든다." },
      { stepOrder: 4, content: "삶은 면을 소스에 버무려 완성한다." },
    ],
  },
  {
    id: 5,
    title: "두부 김치찌개",
    thumbnailUrl: "https://picsum.photos/seed/kimchi/400/300",
    categoryName: "한식",
    cookTimeMin: 20,
    youtubeUrl: "https://www.youtube.com/watch?v=example5",
    favorite: false,
    ingredients: [
      {
        ingredientId: 17,
        name: "두부",
        amount: "200",
        unit: "g",
        isSubstitutable: false,
        fridgeStatus: "ENOUGH",
      },
      {
        ingredientId: 18,
        name: "김치",
        amount: "200",
        unit: "g",
        isSubstitutable: false,
        fridgeStatus: "ENOUGH",
      },
      {
        ingredientId: 19,
        name: "돼지고기",
        amount: "100",
        unit: "g",
        isSubstitutable: true,
        fridgeStatus: "NONE", // 냉장고에 없음
      },
      {
        ingredientId: 20,
        name: "대파",
        amount: "1",
        unit: "대",
        isSubstitutable: true,
        fridgeStatus: "ENOUGH",
      },
    ],
    steps: [
      { stepOrder: 1, content: "냄비에 기름을 두르고 돼지고기를 볶는다." },
      { stepOrder: 2, content: "김치를 넣고 함께 볶는다." },
      { stepOrder: 3, content: "물을 붓고 끓어오르면 두부를 넣는다." },
      { stepOrder: 4, content: "대파를 넣고 한소끔 더 끓여 완성한다." },
    ],
  },
];

