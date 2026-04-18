"use client";

import { useState } from "react";

type Category = "채소" | "육류" | "유제품" | "기타";
type QuantityStatus = "적음" | "보통" | "많음";
type QuantityType = "status" | "number";
type UnitOption = "개" | "g" | "ml" | "직접입력";

const CATEGORIES: Category[] = ["채소", "육류", "유제품", "기타"];
const QUANTITY_STATUSES: QuantityStatus[] = ["적음", "보통", "많음"];
const UNITS: UnitOption[] = ["개", "g", "ml", "직접입력"];

export type IngredientForm = {
  name: string;
  category: Category;
  purchaseDate: string;
  expiryDate: string;
  quantityType: QuantityType;
  quantityStatus: QuantityStatus;
  quantityValue: string;
  unit: UnitOption;
  customUnit: string;
  favorite: boolean;
};

// 새 재료 추가 시 기본값 — FridgePage에서 초기화할 때 사용
export const DEFAULT_INGREDIENT_FORM: IngredientForm = {
  name: "",
  category: "채소",
  purchaseDate: "",
  expiryDate: "",
  quantityType: "status",
  quantityStatus: "보통",
  quantityValue: "",
  unit: "개",
  customUnit: "",
  favorite: false,
};

type IngredientModalProps = {
  isOpen: boolean;
  mode: "add" | "edit";
  form: IngredientForm;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;           // edit 모드에서만 사용
  onChange: (nextForm: IngredientForm) => void;
};

export default function IngredientModal({
  isOpen,
  mode,
  form,
  onClose,
  onSave,
  onDelete,
  onChange,
}: IngredientModalProps) {
  if (!isOpen) return null;

  const titleText = mode === "edit" ? "재료 수정" : "재료 추가";

  function handleDelete() {
    const confirmed = window.confirm(`"${form.name}" 을(를) 삭제할까요?`);
    if (confirmed) {
      onDelete?.();
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[430px] rounded-t-3xl px-6 pt-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{titleText}</h2>
          {mode === "edit" && (
            <button
              onClick={handleDelete}
              aria-label="재료 삭제"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5">

          {/* 재료명 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">재료명</label>
            <input
              type="text"
              placeholder="재료명 입력"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-600"
            />
          </div>

          {/* 분류 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">분류</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => onChange({ ...form, category: e.target.value as Category })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-green-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          </div>

          {/* 구매일자 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">구매일자</label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => onChange({ ...form, purchaseDate: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-600"
            />
          </div>

          {/* 유통기한 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">유통기한</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => onChange({ ...form, expiryDate: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-600"
            />
          </div>

          {/* 수량 */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">수량</label>

            {/* 수치형 / 상태형 토글 */}
            <div className="flex rounded-xl border border-gray-300 overflow-hidden mb-3">
              {(["수치형", "상태형"] as const).map((label) => {
                const type: QuantityType = label === "수치형" ? "number" : "status";
                const isActive = form.quantityType === type;
                return (
                  <button
                    key={label}
                    onClick={() => onChange({ ...form, quantityType: type })}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors
                      ${isActive ? "bg-gray-200 text-gray-900" : "bg-white text-gray-400"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* 수치형 */}
            {form.quantityType === "number" && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.quantityValue}
                  onChange={(e) => onChange({ ...form, quantityValue: e.target.value })}
                  className="w-24 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:border-green-600"
                />
                <div className="relative flex-1">
                  <select
                    value={form.unit}
                    onChange={(e) =>
                      onChange({ ...form, unit: e.target.value as UnitOption, customUnit: "" })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-green-600"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                </div>

                {/* 직접입력 선택 시 텍스트 필드 추가 노출 */}
                {form.unit === "직접입력" && (
                  <input
                    type="text"
                    placeholder="단위 입력"
                    value={form.customUnit}
                    onChange={(e) => onChange({ ...form, customUnit: e.target.value })}
                    className="w-24 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-600"
                  />
                )}
              </div>
            )}

            {/* 상태형 */}
            {form.quantityType === "status" && (
              <div className="flex gap-2">
                {QUANTITY_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => onChange({ ...form, quantityStatus: status })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors
                      ${form.quantityStatus === status
                        ? "bg-green-50 border-green-600 text-green-700"
                        : "bg-white border-gray-300 text-gray-500"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 즐겨찾기 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(e) => onChange({ ...form, favorite: e.target.checked })}
              className="w-5 h-5 accent-green-600 rounded"
            />
            <span className="text-sm text-gray-700">즐겨찾기</span>
          </label>
        </div>

        {/* 취소 / 저장 버튼 */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-gray-300 text-gray-600 text-sm font-medium"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-3.5 rounded-2xl bg-green-600 text-white text-sm font-bold"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}