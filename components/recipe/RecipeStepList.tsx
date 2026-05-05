import type { RecipeStep } from "@/types/recipe";

type RecipeStepListProps = {
  steps: RecipeStep[];
};

export default function RecipeStepList({ steps }: RecipeStepListProps) {
  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">조리방법</h2>
      <div className="relative">
        {/* 타임라인 선 */}
        <div className="absolute left-[15px] top-6 bottom-0 w-0.5 bg-gray-100" />

        <div className="flex flex-col gap-5">
          {sortedSteps.map((step) => (
            <div key={step.stepOrder} className="flex gap-3 relative">
              {/* 스텝 번호 원 */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center shadow-sm shadow-green-200 z-10">
                {step.stepOrder}
              </div>

              {/* 내용 카드 */}
              <div className="flex-1 bg-gray-50 rounded-xl px-3.5 py-3 mt-0.5">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {step.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
