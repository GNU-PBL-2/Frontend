import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav"
import FloatingCameraButton from "@/components/FloatingCameraButton"

export default function Home() {
  const username = "홍길동"

  const summaryData = [
    {name : "폐기 임박", value : 4, color : "text-red-500"},
    {name : "사용 권장", value : 7, color : "text-yellow-500"},
    {name : "전체 재료", value : 25, color : "text-green-600"},
  ];

  const urgentItems = [
    {name : "두부", dday : "D-1"},
    {name : "시금치", dday : "D-1"},
    {name : "계란", dday : "D-3"},
    ]

  const recipeItems = [
    {name : "두부조림", picture : ""},
    {name : "시금치무침", picture : ""},
    {name : "계란찜", picture : ""},
  ]

  return (
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
            폐기 위험 재료 {urgentItems.filter(item => item.dday === "D-1").length}개
            </div>

            <div className="text-base mb-2 text-left">
              {urgentItems.filter(item => item.dday === "D-1").map(item => item.name).join(", ")}
            </div>
          </div>          
        </div>

        <div className="mt-8 space-y-8">  {/*현황 요약, 임박 재료, 추천 레시피 */}
          <div>
            <h2 className="text-lg font-bold mb-3">현황 요약</h2>
              <div className="grid grid-cols-3 gap-3">
                {summaryData.map((item) => (
                  <div
                    key={item.name}
                    className="border border-gray-300 rounded-md bg-white p-3 h-28 flex flex-col justify-between shadow-sm"
                    >
                      <p className="text-medium text-gray-700 leading-tight">{item.name}</p>
                      <p className={`text-4xl font-bold text-right ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">임박 재료</h2>
              <Link href="/urgent" className="text-sm text-green-700">전체보기</Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {urgentItems.map((item) => (
                <div
                  key={item.name}
                  className="border border-red-300 rounded-md bg-white p-3 h-28 flex flex-col justify-between"
                  >
                    <p className="text-base font-medium text-gray-800">{item.name}</p>
                    <p className="text-4xl font-bold text-right text-red-500">
                      {item.dday}
                    </p>
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
