"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { fetchAdminRecipes, deleteRecipe } from "@/lib/adminApi";
import { RecipeListItem } from "@/types/recipe";

const CATEGORY_COLORS: Record<string, string> = {
  한식: "bg-orange-100 text-orange-700",
  중식: "bg-red-100 text-red-700",
  일식: "bg-blue-100 text-blue-700",
  양식: "bg-purple-100 text-purple-700",
  분식: "bg-yellow-100 text-yellow-700",
  기타: "bg-gray-100 text-gray-600",
};

export default function AdminRecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<RecipeListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminRecipes({ keyword, page, size: 20 });
      setRecipes(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "목록을 불러올 수 없어요");
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setKeyword(inputVal.trim());
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteRecipe(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* 검색 + 등록 버튼 */}
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="레시피 검색..."
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm
                focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700
              hover:bg-gray-200 transition-colors"
          >
            검색
          </button>
        </form>
        <button
          onClick={() => router.push("/admin/recipes/new")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-700 text-white
            text-sm font-bold hover:bg-green-600 transition-colors shrink-0"
        >
          <Plus size={15} />
          새 레시피
        </button>
      </div>

      {/* 결과 수 */}
      {!loading && !error && (
        <p className="text-xs text-gray-400">
          총 {(totalElements ?? 0).toLocaleString()}개의 레시피
          {keyword && (
            <button
              onClick={() => {
                setKeyword("");
                setInputVal("");
                setPage(0);
              }}
              className="ml-2 inline-flex items-center gap-0.5 text-green-600 font-semibold"
            >
              &quot;{keyword}&quot; <X size={11} />
            </button>
          )}
        </p>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl bg-gray-50 animate-pulse"
            >
              <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={load}
            className="mt-2 text-xs font-bold text-red-600 underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 목록 */}
      {!loading && !error && (
        <>
          {recipes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">레시피가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  {/* 썸네일 */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {recipe.thumbnailUrl ? (
                      <Image
                        src={recipe.thumbnailUrl}
                        alt={recipe.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">
                        🍽
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {recipe.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {recipe.cookTimeMin}분
                      </span>
                      <span className="text-xs text-gray-200">·</span>
                      <span className="text-[10px] font-medium text-gray-500">
                        #{recipe.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {recipe.cookable && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                          조리가능
                        </span>
                      )}
                      {recipe.expiringIngredientCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          임박 {recipe.expiringIngredientCount}개
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        router.push(`/admin/recipes/${recipe.id}/edit`)
                      }
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      title="수정"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(recipe);
                        setDeleteError("");
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-600"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-600"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl p-6 shadow-xl mb-4 sm:mb-0">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              레시피 삭제
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-semibold text-gray-800">
                {deleteTarget.title}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              이 레시피를 삭제하면 복구할 수 없습니다. 계속하시겠습니까?
            </p>

            {deleteError && (
              <p className="mt-3 text-sm text-red-600 font-medium">
                {deleteError}
              </p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                  text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold
                  hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    삭제 중...
                  </span>
                ) : (
                  "삭제"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
