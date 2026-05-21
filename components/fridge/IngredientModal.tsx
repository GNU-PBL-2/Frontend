"use client";

import { useState } from "react";
import { FridgeForm, MasterIngredient } from "@/lib/fridgeApi";
import { Search, X, Trash2, Check } from "lucide-react";

// ── 애니메이션 ────────────────────────────────────────────────────
const STYLES = `
  @keyframes sheet-up {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes backdrop-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes field-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes chip-pop {
    0%   { transform: scale(0.85); opacity: 0; }
    60%  { transform: scale(1.04); }
    100% { transform: scale(1);    opacity: 1; }
  }
  @keyframes dropdown-in {
    from { opacity: 0; transform: translateY(-6px) scaleY(0.95); }
    to   { opacity: 1; transform: translateY(0)   scaleY(1); }
  }
  .anim-sheet-up    { animation: sheet-up    0.4s cubic-bezier(0.32,0.72,0,1) both; }
  .anim-backdrop    { animation: backdrop-fade 0.25s ease both; }
  .anim-field-in    { animation: field-in    0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-chip-pop    { animation: chip-pop    0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
  .anim-dropdown-in { animation: dropdown-in 0.2s cubic-bezier(0.22,1,0.36,1) both; transform-origin: top; }
`;

const STATUS_OPTIONS = ["적음", "보통", "많음"] as const;
type StatusOption = typeof STATUS_OPTIONS[number];

type IngredientModalProps = {
  isOpen: boolean;
  mode: "add" | "edit";
  form: FridgeForm;
  masterIngredients: MasterIngredient[];
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  onChange: (next: FridgeForm) => void;
};

export default function IngredientModal({
  isOpen,
  mode,
  form,
  masterIngredients,
  onClose,
  onSave,
  onDelete,
  onChange,
}: IngredientModalProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isOpen) return null;

  const titleText = mode === "edit" ? "재료 수정" : "재료 추가";
  const isStatusMode = (STATUS_OPTIONS as readonly string[]).includes(form.unit);

  const filteredIngredients = masterIngredients
    .filter((ing) => ing.name.includes(form.ingredientSearch.trim()))
    .slice(0, 8);

  function handleSelectIngredient(ing: MasterIngredient) {
    onChange({
      ...form,
      selectedIngredientId: ing.ingredientId,
      selectedIngredientName: ing.name,
      selectedCategoryName: ing.categoryName,
      ingredientSearch: ing.name,
    });
    setShowDropdown(false);
  }

  function handleClearIngredient() {
    onChange({
      ...form,
      selectedIngredientId: null,
      selectedIngredientName: "",
      selectedCategoryName: "",
      ingredientSearch: "",
    });
  }

  function handleSwitchToStatus() {
    onChange({ ...form, quantity: "1", unit: "적음" });
  }

  function handleSwitchToNumeric() {
    onChange({ ...form, quantity: "1", unit: "개" });
  }

  function handleDelete() {
    const confirmed = window.confirm(`"${form.selectedIngredientName}" 을(를) 삭제할까요?`);
    if (confirmed) {
      onDelete?.();
      onClose();
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="fixed inset-0 bg-black/40 z-[100] flex items-end justify-center anim-backdrop"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-[430px] rounded-t-3xl flex flex-col max-h-[90vh] anim-sheet-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 드래그 핸들 */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 pt-3 pb-4 shrink-0">
            <h2 className="text-xl font-bold text-gray-900">{titleText}</h2>
            <div className="flex items-center gap-2">
              {mode === "edit" && (
                <button
                  onClick={handleDelete}
                  aria-label="재료 삭제"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400
                    hover:bg-red-100 active:scale-90 transition-all duration-150"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500
                  hover:bg-gray-200 active:scale-90 transition-all duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── 재료 검색 (추가 모드) — overflow-y-auto 밖에 위치 ── */}
          {mode === "add" && (
            <div className="px-6 pb-4 shrink-0 relative z-10 anim-field-in" style={{ animationDelay: "40ms" }}>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block tracking-wide uppercase">
                재료 검색
              </label>

              {form.selectedIngredientId ? (
                /* 선택된 재료 칩 */
                <div className="flex items-center justify-between bg-green-50 border-2 border-green-500
                  rounded-xl px-4 py-3 anim-chip-pop">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {form.selectedIngredientName}
                    </span>
                    <span className="text-[11px] text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                      {form.selectedCategoryName}
                    </span>
                  </div>
                  <button
                    onClick={handleClearIngredient}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-400
                      hover:text-gray-600 active:scale-90 transition-all duration-150 shadow-sm"
                    aria-label="선택 해제"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* 검색 인풋 + 드롭다운 */
                <div className="relative">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3
                    focus-within:border-green-500 focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]
                    transition-all duration-200 bg-white">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="재료명을 검색하세요"
                      value={form.ingredientSearch}
                      onChange={(e) => {
                        onChange({ ...form, ingredientSearch: e.target.value });
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                      className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                    />
                    {form.ingredientSearch && (
                      <button
                        onMouseDown={() => onChange({ ...form, ingredientSearch: "" })}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {showDropdown && filteredIngredients.length > 0 && (
                    <div className="absolute z-[200] w-full bg-white border border-gray-200 rounded-xl mt-1.5
                      shadow-[0_8px_24px_rgba(0,0,0,0.1)] max-h-48 overflow-y-auto anim-dropdown-in">
                      {filteredIngredients.map((ing, i) => (
                        <button
                          key={ing.ingredientId}
                          onMouseDown={() => handleSelectIngredient(ing)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-green-50
                            border-b border-gray-100 last:border-none transition-colors duration-100"
                          style={{ animationDelay: `${i * 20}ms` }}
                        >
                          <span className="font-semibold text-gray-900">{ing.name}</span>
                          <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                            {ing.categoryName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 스크롤 가능한 폼 영역 */}
          <div className="flex-1 overflow-y-auto px-6 pb-2">
            <div className="flex flex-col gap-5">

              {/* ── 재료명 표시 (수정 모드) ── */}
              {mode === "edit" && (
                <div className="anim-field-in" style={{ animationDelay: "40ms" }}>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block tracking-wide uppercase">재료</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <span className="text-sm font-bold text-gray-900">{form.selectedIngredientName}</span>
                    <span className="text-[11px] text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
                      {form.selectedCategoryName}
                    </span>
                  </div>
                </div>
              )}

              {/* ── 유통기한 ── */}
              <div className="anim-field-in" style={{ animationDelay: "80ms" }}>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block tracking-wide uppercase">유통기한</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => onChange({ ...form, expiryDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900
                    focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]
                    transition-all duration-200 bg-white"
                />
              </div>

              {/* ── 수량 ── */}
              <div className="anim-field-in" style={{ animationDelay: "120ms" }}>
                {/* 레이블 + 모드 토글 */}
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide uppercase">수량</label>
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={handleSwitchToNumeric}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150
                        ${!isStatusMode
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      숫자형
                    </button>
                    <button
                      onClick={handleSwitchToStatus}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150
                        ${isStatusMode
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      상태형
                    </button>
                  </div>
                </div>

                {/* 숫자형: 숫자 + 단위 입력 */}
                {!isStatusMode && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="1"
                      value={form.quantity}
                      onChange={(e) => onChange({ ...form, quantity: e.target.value })}
                      className="w-24 border border-gray-200 rounded-xl px-3 py-3 text-sm text-center text-gray-900
                        focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]
                        transition-all duration-200 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="단위 (개, g, ml…)"
                      value={form.unit}
                      onChange={(e) => onChange({ ...form, unit: e.target.value })}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900
                        focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]
                        transition-all duration-200 bg-white"
                    />
                  </div>
                )}

                {/* 상태형: 적음 / 보통 / 많음 pill */}
                {isStatusMode && (
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map((opt) => {
                      const active = form.unit === opt;
                      const colorMap: Record<StatusOption, string> = {
                        적음: active ? "bg-red-500 border-red-500 text-white" : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400",
                        보통: active ? "bg-orange-500 border-orange-500 text-white" : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-400",
                        많음: active ? "bg-green-500 border-green-500 text-white" : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-500",
                      };
                      return (
                        <button
                          key={opt}
                          onClick={() => onChange({ ...form, unit: opt })}
                          className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all duration-150 active:scale-95 ${colorMap[opt]}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── 취소 / 저장 버튼 (고정) ── */}
          <div className="flex gap-3 px-6 pt-4 pb-10 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold
                active:scale-[0.97] transition-transform duration-150 bg-white"
            >
              취소
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-3.5 rounded-2xl bg-green-600 text-white text-sm font-bold
                active:scale-[0.97] transition-transform duration-150
                shadow-[0_4px_14px_rgba(22,163,74,0.35)]"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
