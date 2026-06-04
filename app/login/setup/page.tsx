"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type Option = { id: number; label: string };

// IDs match backend data.sql exactly
const categoryOptions: Option[] = [
  { id: 1, label: "한식" },
  { id: 2, label: "중식" },
  { id: 3, label: "일식" },
  { id: 4, label: "양식" },
  { id: 5, label: "동남아식" },
  { id: 6, label: "채식" },
  { id: 7, label: "분식" },
  { id: 8, label: "베이커리" },
];

const tasteOptions: Option[] = [
  { id: 1, label: "매운맛" },
  { id: 2, label: "달콤한 맛" },
  { id: 3, label: "짭짤한 맛" },
  { id: 4, label: "새콤한 맛" },
  { id: 5, label: "고소한 맛" },
  { id: 6, label: "담백한 맛" },
  { id: 7, label: "쓴맛" },
];

const allergyOptions: Option[] = [
  { id: 1, label: "난류(달걀)" },
  { id: 2, label: "우유" },
  { id: 3, label: "메밀" },
  { id: 4, label: "땅콩" },
  { id: 5, label: "대두(콩)" },
  { id: 6, label: "밀" },
  { id: 7, label: "고등어" },
  { id: 8, label: "게" },
  { id: 9, label: "새우" },
  { id: 10, label: "돼지고기" },
  { id: 11, label: "복숭아" },
  { id: 12, label: "토마토" },
  { id: 13, label: "아황산류" },
  { id: 14, label: "호두" },
  { id: 15, label: "닭고기" },
  { id: 16, label: "쇠고기" },
  { id: 17, label: "오징어" },
  { id: 18, label: "조개류" },
  { id: 19, label: "잣" },
  { id: 20, label: "아몬드" },
  { id: 21, label: "캐슈넛" },
  { id: 22, label: "참깨" },
];

const steps = [
  {
    key: "categories" as const,
    icon: "🍽",
    title: "어떤 요리를 좋아하시나요?",
    description: "즐겨 찾는 요리를 골라두면 더 잘 맞는 추천을 준비할 수 있어요.",
    options: categoryOptions,
    tone: "rose" as const,
  },
  {
    key: "tastes" as const,
    icon: "💛",
    title: "좋아하는 맛을 알려주세요",
    description: "입맛에 맞는 메뉴를 추천하기 위해 취향을 먼저 알아갈게요.",
    options: tasteOptions,
    tone: "emerald" as const,
  },
  {
    key: "allergies" as const,
    icon: "⚠️",
    title: "알레르기를 알려주세요",
    description: "먹지 못하는 재료를 피해 더 안전한 추천을 도와드릴게요.",
    options: allergyOptions,
    tone: "amber" as const,
  },
];

type StepKey = (typeof steps)[number]["key"];
type Tone = "rose" | "emerald" | "amber";

function chipClasses(selected: boolean, tone: Tone) {
  if (!selected) return "border-[#d8dde5] bg-white text-[#5f6671]";
  const tones: Record<Tone, string> = {
    rose: "border-[#f6c7cc] bg-[#fff0f1] text-[#d45c68]",
    emerald: "border-[#c8ecd7] bg-[#effcf4] text-[#2b9464]",
    amber: "border-[#f5e0a0] bg-[#fff7d8] text-[#b27f07]",
  };
  return tones[tone];
}

export default function LoginSetupPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTastes, setSelectedTastes] = useState<number[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const selections = useMemo(
    () => ({ categories: selectedCategories, tastes: selectedTastes, allergies: selectedAllergies }),
    [selectedCategories, selectedTastes, selectedAllergies]
  );

  const setterMap: Record<StepKey, React.Dispatch<React.SetStateAction<number[]>>> = {
    categories: setSelectedCategories,
    tastes: setSelectedTastes,
    allergies: setSelectedAllergies,
  };

  const toggleSelection = (optionId: number) => {
    const current = selections[currentStep.key];
    setterMap[currentStep.key](
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    );
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      router.push("/login");
    } else {
      setStepIndex((prev) => prev - 1);
    }
  };

  const handleNext = async () => {
    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) {
        setSubmitError("로그인 정보가 없어요. 다시 로그인한 뒤 저장해 주세요.");
        return;
      }
      const res = await fetch(`${API_URL}/api/v1/users/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categories: selectedCategories,
          tastes: selectedTastes,
          allergies: selectedAllergies,
        }),
      });
      if (!res.ok) throw new Error("Onboard failed");
      router.push("/login/complete");
    } catch {
      setSubmitError("선호도 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7EF] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col bg-white px-6 py-6">
        {/* 헤더 */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className="text-2xl leading-none text-[#7a818d] transition-colors hover:text-[#111111]"
          >
            ←
          </button>
        </div>

        {/* 스텝 정보 */}
        <section className="mt-10">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#dfe4eb] bg-white text-2xl shadow-sm">
            {currentStep.icon}
          </div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#9aa1ac]">
            STEP {stepIndex + 1} / {steps.length}
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold tracking-[-0.04em]">
            {currentStep.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6f7682]">
            {currentStep.description}
          </p>
        </section>

        {/* 선택 칩 */}
        <section className="mt-8 grid grid-cols-2 gap-3">
          {currentStep.options.map((option) => {
            const selected = selections[currentStep.key].includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleSelection(option.id)}
                className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-transform active:scale-[0.98] ${chipClasses(selected, currentStep.tone)}`}
              >
                {option.label}
              </button>
            );
          })}
        </section>

        {/* 버튼 영역 */}
        <div className="mt-auto space-y-3 pb-6 pt-10">
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[#118d3f] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(17,141,63,0.18)] transition-transform active:scale-[0.99] disabled:opacity-60"
          >
            {isSubmitting ? "저장 중..." : isLastStep ? "완료" : "다음"}
          </button>
          {submitError && (
            <p role="alert" className="text-center text-sm font-medium text-[#d45c68]">
              {submitError}
            </p>
          )}
          {!isLastStep && (
            <button
              type="button"
              onClick={() => setStepIndex((prev) => prev + 1)}
              className="w-full rounded-2xl border border-[#d8dde5] bg-white px-5 py-4 text-sm font-semibold text-[#616975]"
            >
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
