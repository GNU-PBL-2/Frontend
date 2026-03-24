import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav"
import FloatingCameraButton from "@/components/FloatingCameraButton"
import { mockIngredients, type Category, type Ingredient } from "@/data/dummydata";

const shelfLifeMap: Record<Category, number> = {
  채소: 7,
  육류: 5,
  유제품: 7,
  기타: 7,
};

function getExpiryDate(purchaseDate: string, category: Category) {
  const date = new Date(purchaseDate);
  date.setDate(date.getDate() + shelfLifeMap[category]);
  return date;
}

function getDaysLeft(purchaseDate: string, category: Category) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = getExpiryDate(purchaseDate, category);
  expiry.setHours(0, 0, 0, 0);

  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getDdayText(daysLeft: number) {
  if (daysLeft < 0) return `D+${Math.abs(daysLeft)}`;
  return `D-${daysLeft}`;
}

function getItemCount(item: Ingredient) {
  return item.quantityValue ?? 1;
}

export default function Home() {
  const username = "홍길동"

  const recipeItems = [
    {name : "두부조림", picture : ""},
    {name : "시금치무침", picture : ""},
    {name : "장조림", picture : ""},
  ];

  const ingredientsWithDays = mockIngredients.map((item) => {
  const daysLeft = getDaysLeft(item.purchaseDate, item.category);
  return {
    ...item,
    daysLeft,
    dday: getDdayText(daysLeft),
  };
  });

  const wasteDangerItems = ingredientsWithDays.filter((item) => item.daysLeft === 1);
  const recommendedItems = ingredientsWithDays.filter(
    (item) => item.daysLeft >= 2 && item.daysLeft <= 5
  );
  const urgentDisplayItems = ingredientsWithDays.filter((item) => item.daysLeft <= 3).sort(((a, b) => a.daysLeft - b.daysLeft));

  const totalCount = mockIngredients.reduce((sum, item) => sum + getItemCount(item), 0);
  const wasteDangerCount = wasteDangerItems.reduce((sum, item) => sum + getItemCount(item), 0);
  const recommendedCount = recommendedItems.reduce((sum, item) => sum + getItemCount(item), 0);

  return  (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen p-4">
        <div className="flex justify-between items-center mt-6">  {/*헤더*/}
          <h1 className="text-2xl font-bold ml-1">
          {username}님의 <span className="text-green-700 mr-2">냉장고</span>
          </h1>
          <span className="text-2xl">🔔</span>
        </div>

        <div className="mt-6 bg-orange-600 text-white p-4 rounded-md py-8 flex items-center"> {/*폐기 위험 재료 */}
          <span className="text-6xl mb-2">🚨</span>
          <div className="flex flex-col">
            <div className="text-2xl font-bold whitespace-nowrap">
            폐기 위험 재료 {wasteDangerCount}개
            </div>

            <div className="text-base mb-2 text-left">
              {wasteDangerItems.length > 0 ? wasteDangerItems.map((item) => item.name).join(", "):""}
            </div>
          </div>          
        </div>

        <div className="mt-8 space-y-8">  {/*현황 요약, 임박 재료, 추천 레시피 */}
          <div>
            <h2 className="text-lg font-bold mb-3">현황 요약</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-gray-300 rounded-md p-3 h-28 flex flex-col justify-between shadow-sm">
                  <p className="text-medium text-gray-700 leading-tight">폐기 임박</p>
                  <p className="text-4xl font-bold text-right text-red-500">{wasteDangerCount}</p>
                </div>

                <div className="bg-white border border-gray-300 rounded-md p-3 h-28 flex flex-col justify-between shadow-sm">
                  <p className="text-medium text-gray-700 leading-tight">사용 권장</p>
                  <p className="text-4xl font-bold text-right text-orange-400">{recommendedCount}</p>
                </div>

                <div className="bg-white border border-gray-300 rounded-md p-3 h-28 flex flex-col justify-between shadow-sm">
                  <p className="text-medium text-gray-700 leading-tight">전체 재료</p>
                  <p className="text-4xl font-bold text-right text-green-600">{totalCount}</p>
                </div>
              </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">임박 재료</h2>
              <Link href="/urgent" className="text-sm text-green-700">전체보기</Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {urgentDisplayItems.map((item) => (
                <div
                  key={item.name}
                  className="border border-red-300 rounded-md bg-white p-3 h-28 flex flex-col justify-between"
                  >
                    <p className="text-base font-medium text-gray-800">{item.name}</p>
                    <p className="text-4xl font-bold text-right text-red-500">{item.dday}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">추천 레시피</h2>
              <button className="text-sm text-green-700">전체보기</button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {recipeItems.map((item) => (
                <div
                  key={item.name}
                  className="rounded-md bg-gray-400 p-2 h-28 flex flex-col items-center justify-between"
                >
                  <div className="w-full h-18 rounded bg-white flex items-center justify-center text-3xl">
                    {item.picture}
                  </div>
                  <p className="text-sm text-white">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-20"/>
        <FloatingCameraButton /> {/*카메라 버튼*/}
      </div>
      
      <BottomNav /> {/*하단 네비게이션바*/}
    </div>
  );
}
