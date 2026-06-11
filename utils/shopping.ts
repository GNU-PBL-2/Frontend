// 부족 재료 구매용 온라인 쇼핑몰 검색 링크
// 쇼핑몰을 바꾸려면 SHOPPING_SEARCH_URL만 교체하면 됩니다.
// 예) 네이버쇼핑: https://search.shopping.naver.com/search/all?query=
const SHOPPING_SEARCH_URL = "https://www.coupang.com/np/search?q=";

export function getShoppingSearchUrl(ingredientName: string): string {
  return `${SHOPPING_SEARCH_URL}${encodeURIComponent(ingredientName)}`;
}

export function openShoppingSearch(ingredientName: string) {
  window.open(getShoppingSearchUrl(ingredientName), "_blank", "noopener,noreferrer");
}
