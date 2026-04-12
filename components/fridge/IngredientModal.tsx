"use client";

type Category = "채소" | "육류" | "유제품" | "기타";
type Quantity = "적음" | "보통" | "많음";

export type IngredientForm = {
  name: string;
  purchaseDate: string;
  category: Category;
  quantity: Quantity;
  quantityValue: string;
  favorite: boolean;
};

type IngredientModalProps = {
  isOpen: boolean;
  mode: "add" | "edit"; // 👈 핵심! 현재 모달의 상태를 결정합니다.
  form: IngredientForm;
  onClose: () => void;
  onSave: () => void;
  onChange: (nextForm: IngredientForm) => void;
};

export default function IngredientModal({
  isOpen,
  mode,
  form,
  onClose,
  onSave,
  onChange,
}: IngredientModalProps) {
  if (!isOpen) return null;

  // 👈 모드에 따라 텍스트를 다르게 설정
  const titleText = mode === "edit" ? "재료 수정" : "재료 추가";
  const buttonText = mode === "edit" ? "수정 완료" : "추가하기";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          {/* 👈 동적으로 렌더링 */}
          <h2 className="text-lg font-bold">{titleText}</h2>
          <button className="text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-gray-100" aria-label="카메라">
            📷
          </button>
        </div>

        <div className="space-y-3">
          
          <input
            type="text"
            placeholder="재료명"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
          />
          

          {/* 👈 날짜 입력 필드 */}
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => onChange({ ...form, purchaseDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
          />

          {/* 👈 카테고리 선택 필드 */}
          <select
            value={form.category}
            onChange={(e) => onChange({ ...form, category: e.target.value as Category })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
          >
            <option value="채소">채소</option>
            <option value="육류">육류</option>
            <option value="유제품">유제품</option>
            <option value="기타">기타</option>
          </select>

          {/* 👈 수량 선택 필드 */}
          <select
            value={form.quantity}
            onChange={(e) => onChange({ ...form, quantity: e.target.value as Quantity })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
          >
            <option value="적음">적음</option>
            <option value="보통">보통</option>
            <option value="많음">많음</option>
          </select>
          {/* 👈 수량 값 입력 필드 */}
          <input
            type="text"
            placeholder="수량"
            value={form.quantityValue}
            onChange={(e) => onChange({ ...form, quantityValue: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
          />

          {/* 👈 즐겨찾기 토글 버튼 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(e) => onChange({ ...form, favorite: e.target.checked })}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm">즐겨찾기</span>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-semibold"
          >
            {/* 👈 동적으로 렌더링 */}
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}