"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Allergy, FoodCategory, TastePreference } from "@/types/preference";
import BottomNav from "@/components/BottomNav";


// 임시 mock 유저 데이터 — 백엔드 연동 시 교체
const MOCK_USER = {
  name: "홍길동",
  email: "abcd1234@naver.com",
};

export default function MyPage() {
  const router = useRouter();

  // 알레르기
  const [allergies, setAllergies] = useState<Allergy[]>(["우유"]);

  // 취향
  const [categories, setCategories] = useState<FoodCategory[]>(["중식"]);
  const [tastes, setTastes] = useState<TastePreference[]>(["단맛"]);

  // 알림 설정
  const [expiryAlert, setExpiryAlert] = useState(true);
  const [recipeAlert, setRecipeAlert] = useState(false);

  // 냉장고 초기화
  function handleResetFridge() {
    const confirmed = window.confirm("냉장고를 초기화할까요? 모든 재료가 삭제됩니다.");
    if (confirmed) {
      // TODO: 백엔드 연동 시 API 호출
      alert("냉장고가 초기화되었습니다.");
    }
  }

  // 즐겨찾기 초기화
  function handleResetFavorite() {
    const confirmed = window.confirm("즐겨찾기를 초기화할까요?");
    if (confirmed) {
      // TODO: 백엔드 연동 시 API 호출
      alert("즐겨찾기가 초기화되었습니다.");
    }
  }

  // 로그아웃
  function handleLogout() {
    const confirmed = window.confirm("로그아웃 할까요?");
    if (confirmed) {
      // TODO: 백엔드 연동 시 처리
    }
  }

  // 회원탈퇴
  function handleWithdraw() {
    const confirmed = window.confirm("정말 탈퇴하시겠어요? 모든 데이터가 삭제됩니다.");
    if (confirmed) {
      // TODO: 백엔드 연동 시 처리
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen pb-24">

        {/* 헤더 */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
        </div>

        {/* 프로필 */}
        <section className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-3">프로필</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
              👤
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{MOCK_USER.name}</p>
              <p className="text-sm text-gray-400">{MOCK_USER.email}</p>
            </div>
          </div>
        </section>

        {/* 알레르기 */}
        <section className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400">알레르기</p>
            <button
              onClick={() => router.push("/mypage/edit/allergy")}
              className="text-xs text-gray-500"
            >
              수정하기 &gt;
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.length > 0 ? (
              allergies.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-500 border border-red-300"
                >
                  {item}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-300">설정된 알레르기가 없어요</p>
            )}
          </div>
        </section>

        {/* 취향설정 */}
        <section className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400">취향설정</p>
            <button
              onClick={() => router.push("/mypage/edit/taste")}
              className="text-xs text-gray-500"
            >
              수정하기 &gt;
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...categories, ...tastes].length > 0 ? (
              [...categories, ...tastes].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 border border-green-300"
                >
                  {item}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-300">설정된 취향이 없어요</p>
            )}
          </div>
        </section>

        {/* 알림설정 */}
        <section className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-3">알림설정</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">폐기 위험 재료 알림</p>
              <button
                onClick={() => setExpiryAlert((prev) => !prev)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5
                  ${expiryAlert ? "bg-green-600" : "bg-gray-200"}`}
              >
                <span className={`w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${expiryAlert ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">레시피 추천 알림</p>
              <button
                onClick={() => setRecipeAlert((prev) => !prev)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5
                  ${recipeAlert ? "bg-green-600" : "bg-gray-200"}`}
              >
                <span className={`w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${recipeAlert ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 데이터 관리 */}
        <section className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-3">데이터 관리</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">냉장고 초기화</p>
              <button
                onClick={handleResetFridge}
                className="text-sm font-semibold text-red-400"
              >
                초기화
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">즐겨찾기 초기화</p>
              <button
                onClick={handleResetFavorite}
                className="text-sm font-semibold text-red-400"
              >
                초기화
              </button>
            </div>
          </div>
        </section>

        {/* 고객센터 */}
        <section className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-3">고객센터</p>
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-between text-sm text-gray-700">
              문의하기 <span className="text-gray-400">&gt;</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-between text-sm text-gray-700"
            >
              로그아웃 <span className="text-gray-400">&gt;</span>
            </button>
            <button
              onClick={handleWithdraw}
              className="text-left text-sm text-gray-300"
            >
              탈퇴하기
            </button>
          </div>
        </section>
        
        {/* BottomNav */}
        <BottomNav />

      </div>
    </div>
  );
}