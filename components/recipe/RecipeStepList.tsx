import type { RecipeStep } from "@/types/recipe";

type RecipeStepListProps = {
  steps: RecipeStep[];
};

export default function RecipeStepList({ steps }: RecipeStepListProps) {
  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder); // stepOrder 기준 정렬
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-900 mb-3">조리방법</h2>
      <div className="flex flex-col gap-4">
        {sortedSteps.map((step) => (
            <div key={step.stepOrder} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center">
                {step.stepOrder}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed pt-0.5">
                {step.content}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}