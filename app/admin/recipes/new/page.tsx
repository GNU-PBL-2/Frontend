"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import RecipeForm from "@/components/admin/RecipeForm";
import { createRecipe } from "@/lib/adminApi";
import { RecipeFormData } from "@/types/recipe";

export default function NewRecipePage() {
  const router = useRouter();
  const [createdId, setCreatedId] = useState<number | null>(null);

  async function handleSubmit(data: RecipeFormData) {
    const id = await createRecipe(data);
    setCreatedId(id);
  }

  if (createdId !== null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <CheckCircle size={48} className="text-green-500" />
        <div>
          <p className="text-base font-bold text-gray-900">레시피 등록 완료</p>
          <p className="text-sm text-gray-500 mt-0.5">레시피 ID: #{createdId}</p>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => router.push(`/recipe/${createdId}`)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold
              text-gray-700 hover:bg-gray-50 transition-colors"
          >
            레시피 보기
          </button>
          <button
            onClick={() => router.push("/admin/recipes")}
            className="px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-bold
              hover:bg-green-600 transition-colors"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        뒤로
      </button>
      <h2 className="text-base font-bold text-gray-900 mb-6">새 레시피 등록</h2>
      <RecipeForm onSubmit={handleSubmit} submitLabel="레시피 등록" />
    </div>
  );
}
