"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import RecipeForm from "@/components/admin/RecipeForm";
import { fetchRecipeDetail } from "@/lib/recipeApi";
import { updateRecipe } from "@/lib/adminApi";
import { RecipeFormData, Recipe } from "@/types/recipe";

function recipeToForm(r: Recipe): RecipeFormData {
  return {
    title: r.title,
    thumbnailUrl: r.thumbnailUrl,
    categoryName: r.categoryName,
    tasteName: r.tasteName,
    cookTimeMin: r.cookTimeMin,
    description: r.description,
    youtubeUrl: r.youtubeUrl,
    ingredients: r.ingredients,
    steps: r.steps,
  };
}

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [defaultValues, setDefaultValues] = useState<RecipeFormData | undefined>();
  const [fetchError, setFetchError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchRecipeDetail(id)
      .then((r) => setDefaultValues(recipeToForm(r)))
      .catch((err) =>
        setFetchError(err instanceof Error ? err.message : "레시피를 불러올 수 없어요")
      );
  }, [id]);

  async function handleSubmit(data: RecipeFormData) {
    await updateRecipe(id, data);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <CheckCircle size={48} className="text-green-500" />
        <div>
          <p className="text-base font-bold text-gray-900">수정 완료</p>
          <p className="text-sm text-gray-500 mt-0.5">레시피 ID: #{id}</p>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => router.push(`/recipe/${id}`)}
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

  if (fetchError) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          뒤로
        </button>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{fetchError}</p>
        </div>
      </div>
    );
  }

  if (!defaultValues) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-32 bg-gray-200 rounded-xl mt-6" />
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
      <h2 className="text-base font-bold text-gray-900 mb-1">레시피 수정</h2>
      <p className="text-xs text-gray-400 mb-6">ID: #{id}</p>
      <RecipeForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="수정 저장"
      />
    </div>
  );
}
