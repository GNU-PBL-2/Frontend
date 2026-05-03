"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Option = {
  id: number;
  label: string;
};

const categoryOptions: Option[] = [
  { id: 1, label: "한식" },
  { id: 2, label: "중식" },
  { id: 3, label: "일식" },
  { id: 4, label: "양식" },
  { id: 5, label: "분식" },
  { id: 6, label: "디저트" },
  { id: 7, label: "야식" },
  { id: 8, label: "간편식" },
];

const tasteOptions: Option[] = [
  { id: 1, label: "매운맛" },
  { id: 2, label: "담백한 맛" },
  { id: 3, label: "새콤한 맛" },
  { id: 4, label: "짭짤한 맛" },
  { id: 5, label: "달콤한 맛" },
  { id: 6, label: "고소한 맛" },
];

const allergyOptions: Option[] = [
  { id: 1, label: "난류" },
  { id: 2, label: "우유" },
  { id: 3, label: "메밀" },
  { id: 4, label: "땅콩" },
  { id: 5, label: "대두" },
  { id: 6, label: "밀" },
  { id: 7, label: "고등어" },
  { id: 8, label: "게" },
  { id: 9, label: "새우" },
  { id: 10, label: "쇠고기" },
  { id: 11, label: "복숭아" },
  { id: 12, label: "토마토" },
];

const steps = [
  {
    key: "categories",
    title: "어떤 요리를 좋아하시나요?",
    description:
      "즐겨 찾는 요리를 골라두면 더 잘 맞는 추천을 준비할 수 있어요.",
    options: categoryOptions,
    tone: "rose" as const,
  },
  {
    key: "tastes",
    title: "좋아하는 맛을 알려주세요",
    description:
      "입맛에 맞는 메뉴를 추천하기 위해 취향을 먼저 알아갈게요.",
    options: tasteOptions,
    tone: "emerald" as const,
  },
  {
    key: "allergies",
    title: "알레르기를 알려주세요",
    description:
      "먹지 못하는 재료를 피해 더 안전한 추천을 도와드릴게요.",
    options: allergyOptions,
    tone: "amber" as const,
  },
];

function chipClasses(selected: boolean, tone: "rose" | "emerald" | "amber") {
  if (!selected) {
    return "border-[#d8dde5] bg-white text-[#5f6671]";
  }

  const tones = {
    rose: "border-[#f6c7cc] bg-[#fff0f1] text-[#d45c68]",
    emerald: "border-[#c8ecd7] bg-[#effcf4] text-[#2b9464]",
    amber: "border-[#f5e0a0] bg-[#fff7d8] text-[#b27f07]",
  };

  return tones[tone];
}

export default function LoginSetupPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTastes, setSelectedTastes] = useState<number[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const selections = useMemo(
    () => ({
      categories: selectedCategories,
      tastes: selectedTastes,
      allergies: selectedAllergies,
    }),
    [selectedAllergies, selectedCategories, selectedTastes]
  );

  const toggleSelection = (optionId: number) => {
    const updateMap = {
      categories: setSelectedCategories,
      tastes: setSelectedTastes,
      allergies: setSelectedAllergies,
    } as const;

    const setter = updateMap[currentStep.key as keyof typeof updateMap];
    const current = selections[currentStep.key as keyof typeof selections];

    setter(
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    );
  };

  const handleNext = () => {
    if (isLastStep) {
      router.push("/login/complete");
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#f2f4f7] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col bg-white px-6 py-6">
        <div className="flex items-center">
          <Link
            href="/login"
            className="text-2xl leading-none text-[#7a818d] transition-colors hover:text-[#111111]"
          >
            ←
          </Link>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#dfe4eb] bg-white text-2xl shadow-sm">
            {currentStep.key === "categories"
              ? "🍽"
              : currentStep.key === "tastes"
                ? "💛"
                : "⚠️"}
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

        <section className="mt-8 grid grid-cols-2 gap-3">
          {currentStep.options.map((option) => {
            const selected = selections[
              currentStep.key as keyof typeof selections
            ].includes(option.id);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleSelection(option.id)}
                className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-transform active:scale-[0.98] ${chipClasses(
                  selected,
                  currentStep.tone
                )}`}
              >
                {option.label}
              </button>
            );
          })}
        </section>

        <div className="mt-auto space-y-3 pb-6 pt-10">
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-2xl bg-[#118d3f] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(17,141,63,0.18)] transition-transform active:scale-[0.99]"
          >
            {isLastStep ? "완료" : "다음"}
          </button>
          {!isLastStep ? (
            <button
              type="button"
              onClick={() => setStepIndex((prev) => prev + 1)}
              className="w-full rounded-2xl border border-[#d8dde5] bg-white px-5 py-4 text-sm font-semibold text-[#616975]"
            >
              건너뛰기
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
