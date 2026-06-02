"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { fetchMasterIngredients, MasterIngredient } from "@/lib/fridgeApi";
import { RecipeFormData, RecipeCategory, RecipeTaste, RecipeIngredient } from "@/types/recipe";

const CATEGORIES: RecipeCategory[] = ["한식", "중식", "일식", "양식", "분식", "기타"];
const TASTES: RecipeTaste[] = ["매운맛", "단맛", "짠맛", "신맛", "고소한맛", "담백한맛", "쓴맛"];

const EMPTY_INGREDIENT: RecipeIngredient = {
  ingredientId: 0,
  name: "",
  amount: "",
  unit: "",
  isSubstitutable: false,
  fridgeStatus: "NONE",
};

const EMPTY_FORM: RecipeFormData = {
  title: "",
  thumbnailUrl: "",
  categoryName: "한식",
  tasteName: "담백한맛",
  cookTimeMin: 30,
  description: "",
  youtubeUrl: "",
  ingredients: [],
  steps: [],
};

interface Props {
  defaultValues?: RecipeFormData;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitLabel?: string;
}

export default function RecipeForm({
  defaultValues,
  onSubmit,
  submitLabel = "저장",
}: Props) {
  const [form, setForm] = useState<RecipeFormData>(defaultValues ?? EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [masters, setMasters] = useState<MasterIngredient[]>([]);
  const [searches, setSearches] = useState<string[]>(
    (defaultValues?.ingredients ?? []).map((i) => i.name)
  );
  const [dropdowns, setDropdowns] = useState<boolean[]>(
    (defaultValues?.ingredients ?? []).map(() => false)
  );

  useEffect(() => {
    fetchMasterIngredients()
      .then(setMasters)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (defaultValues) {
      setForm(defaultValues);
      setSearches(defaultValues.ingredients.map((i) => i.name));
      setDropdowns(defaultValues.ingredients.map(() => false));
    }
  }, [defaultValues]);

  function setField<K extends keyof RecipeFormData>(key: K, val: RecipeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function addIngredient() {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...EMPTY_INGREDIENT }],
    }));
    setSearches((prev) => [...prev, ""]);
    setDropdowns((prev) => [...prev, false]);
  }

  function removeIngredient(idx: number) {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== idx),
    }));
    setSearches((prev) => prev.filter((_, i) => i !== idx));
    setDropdowns((prev) => prev.filter((_, i) => i !== idx));
  }

  function patchIngredient(idx: number, changes: Partial<RecipeIngredient>) {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === idx ? { ...ing, ...changes } : ing
      ),
    }));
  }

  function selectMaster(idx: number, master: MasterIngredient) {
    patchIngredient(idx, { ingredientId: master.ingredientId, name: master.name });
    setSearches((prev) => prev.map((s, i) => (i === idx ? master.name : s)));
    setDropdowns((prev) => prev.map((d, i) => (i === idx ? false : d)));
  }

  function addStep() {
    setForm((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { stepOrder: prev.steps.length + 1, content: "" },
      ],
    }));
  }

  function removeStep(idx: number) {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stepOrder: i + 1 })),
    }));
  }

  function updateStep(idx: number, content: string) {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === idx ? { ...s, content } : s)),
    }));
  }

  function moveStep(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= form.steps.length) return;
    setForm((prev) => {
      const steps = [...prev.steps];
      [steps[idx], steps[next]] = [steps[next], steps[idx]];
      return { ...prev, steps: steps.map((s, i) => ({ ...s, stepOrder: i + 1 })) };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("레시피 이름을 입력해주세요");
      return;
    }
    if (form.cookTimeMin <= 0) {
      setError("조리 시간은 1분 이상이어야 합니다");
      return;
    }
    if (form.steps.length === 0) {
      setError("조리 단계를 하나 이상 추가해주세요");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 transition-colors bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 기본 정보 */}
      <section>
        <h2 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
          기본 정보
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              레시피 이름 *
            </label>
            <input
              type="text"
              className={input}
              placeholder="예) 김치찌개"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                카테고리
              </label>
              <select
                className={input}
                value={form.categoryName}
                onChange={(e) =>
                  setField("categoryName", e.target.value as RecipeCategory)
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                맛
              </label>
              <select
                className={input}
                value={form.tasteName}
                onChange={(e) =>
                  setField("tasteName", e.target.value as RecipeTaste)
                }
              >
                {TASTES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              조리 시간 (분) *
            </label>
            <input
              type="number"
              min={1}
              className={input}
              placeholder="30"
              value={form.cookTimeMin}
              onChange={(e) => setField("cookTimeMin", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              설명
            </label>
            <textarea
              className={`${input} resize-none`}
              rows={2}
              placeholder="요리에 대한 간단한 설명을 입력하세요"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              썸네일 URL
            </label>
            <input
              type="url"
              className={input}
              placeholder="https://..."
              value={form.thumbnailUrl}
              onChange={(e) => setField("thumbnailUrl", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              YouTube URL
            </label>
            <input
              type="url"
              className={input}
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtubeUrl}
              onChange={(e) => setField("youtubeUrl", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 재료 */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">
            재료{" "}
            <span className="text-gray-400 font-normal">({form.ingredients.length}개)</span>
          </h2>
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-600"
          >
            <Plus size={14} /> 재료 추가
          </button>
        </div>
        {form.ingredients.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">
            재료를 추가해주세요
          </p>
        )}
        <div className="space-y-3">
          {form.ingredients.map((ing, idx) => {
            const query = searches[idx] ?? "";
            const filtered = masters
              .filter((m) => m.name.includes(query))
              .slice(0, 8);

            return (
              <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    재료 {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* 재료명 검색 */}
                <div className="relative">
                  <input
                    type="text"
                    className={input}
                    placeholder="재료명 검색..."
                    value={query}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearches((prev) =>
                        prev.map((s, i) => (i === idx ? v : s))
                      );
                      setDropdowns((prev) =>
                        prev.map((d, i) => (i === idx ? true : d))
                      );
                      patchIngredient(idx, { name: v, ingredientId: 0 });
                    }}
                    onFocus={() =>
                      setDropdowns((prev) =>
                        prev.map((d, i) => (i === idx ? true : d))
                      )
                    }
                    onBlur={() =>
                      setTimeout(
                        () =>
                          setDropdowns((prev) =>
                            prev.map((d, i) => (i === idx ? false : d))
                          ),
                        150
                      )
                    }
                  />
                  {dropdowns[idx] && filtered.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                      {filtered.map((m) => (
                        <button
                          key={m.ingredientId}
                          type="button"
                          className="w-full text-left px-3.5 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                          onMouseDown={() => selectMaster(idx, m)}
                        >
                          <span className="font-medium">{m.name}</span>
                          <span className="text-xs text-gray-400">
                            {m.categoryName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    className={input}
                    placeholder="양 (예: 200)"
                    value={ing.amount}
                    onChange={(e) =>
                      patchIngredient(idx, { amount: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className={input}
                    placeholder="단위 (예: g)"
                    value={ing.unit}
                    onChange={(e) =>
                      patchIngredient(idx, { unit: e.target.value })
                    }
                  />
                  <label className="flex items-center gap-1.5 px-1 whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ing.isSubstitutable}
                      onChange={(e) =>
                        patchIngredient(idx, {
                          isSubstitutable: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-green-600"
                    />
                    <span className="text-xs text-gray-600">대체가능</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 조리 단계 */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">
            조리 단계{" "}
            <span className="text-gray-400 font-normal">
              ({form.steps.length}단계)
            </span>
          </h2>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-600"
          >
            <Plus size={14} /> 단계 추가
          </button>
        </div>
        {form.steps.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">
            조리 단계를 추가해주세요
          </p>
        )}
        <div className="space-y-3">
          {form.steps.map((step, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-green-700">
                  Step {step.stepOrder}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveStep(idx, -1)}
                    disabled={idx === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(idx, 1)}
                    disabled={idx === form.steps.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <textarea
                className={`${input} resize-none`}
                rows={2}
                placeholder="조리 방법을 설명해주세요..."
                value={step.content}
                onChange={(e) => updateStep(idx, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-green-700 text-white text-sm font-bold
          disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600
          active:bg-green-800 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            저장 중...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
