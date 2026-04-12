"use client";

import { useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import AddIngredient, { IngredientForm } from "@/components/fridge/IngredientModal";
import FridgeItemCard from "@/components/fridge/FridgeItemCard";
import { mockIngredients } from "@/data/dummydata";
import { Ingredient, Category, Quantity } from "@/types/ingredient";
import { getDaysLeft } from "@/utils/expiryHelpers";

type FilterCategory = "전체" | "채소" | Category;

const categories: FilterCategory[] = ["전체", "채소", "육류", "유제품", "기타"];

const INITIAL_FORM: IngredientForm = {
  name: "",
  purchaseDate: "",
  expiryDate: "",
  category: "채소",
  quantity: "보통",
  quantityType: "status",
  quantityValue: "",
  unit: "개",
  customUnit: "",
  favorite: false,
};

export default function FridgePage() {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("전체");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const [items, setItems] = useState<Ingredient[]>(mockIngredients);
  const [form, setForm] = useState<IngredientForm>(INITIAL_FORM);


  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const isSelectMode = selectedIds.length > 0;

  const filteredItems = useMemo(() => {
    const filtered =
      selectedCategory === "전체"
        ? items
        : items.filter((item) => item.category === selectedCategory);

    return [...filtered].sort(
      (a, b) =>
        getDaysLeft(a.expiryDate) -
        getDaysLeft(b.expiryDate)
    );
  }, [items, selectedCategory]);

  // ✅ 추가 모달 열기
  const handleOpenAdd = () => {
    setModalMode("add");
    setForm(INITIAL_FORM);
    setEditingItemId(null);
    setIsModalOpen(true);
  };

  // ✅ 수정 모달 열기
  const handleOpenEdit = (item: Ingredient) => {
    setModalMode("edit");
    setEditingItemId(item.id);

    setForm({
      name: item.name,
      purchaseDate: item.purchaseDate,
      expiryDate: item.expiryDate ?? "",
      category: item.category,
      quantityType: item.quantityType ?? "status",
      quantityStatus: item.quantityStatus ?? "보통",
      quantity: item.quantity,
      quantityValue: item.quantityValue ? String(item.quantityValue) : "",
      unit: "개",
      customUnit: "",
      favorite: item.favorite,
    });

    setIsModalOpen(true);
  };

  // ✅ 저장 (추가 + 수정 통합)
  const handleSaveItem = () => {
    if (!form.name.trim() || !form.purchaseDate) {
      alert("재료명과 구매일자를 입력해 주세요.");
      return;
    }

    if (modalMode === "add") {
      const newItem: Ingredient = {
        id: Date.now(),
        name: form.name.trim(),
        purchaseDate: form.purchaseDate,
        category: form.category,
        quantity: form.quantity,
        quantityValue: form.quantityValue ? Number(form.quantityValue) : undefined,
        favorite: form.favorite,
      };

      setItems((prev) => [newItem, ...prev]);
    } else if (modalMode === "edit" && editingItemId !== null) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                name: form.name.trim(),
                purchaseDate: form.purchaseDate,
                category: form.category,
                quantity: form.quantity,
                quantityValue: form.quantityValue
                  ? Number(form.quantityValue)
                  : undefined,
                favorite: form.favorite,
              }
            : item
        )
      );
    }

    setIsModalOpen(false);
    setForm(INITIAL_FORM);
    setEditingItemId(null);
  };

  // ✅ 아이템 롱프레스 (선택 모드 진입)
  const handleLongPress = (id: number) => {
    setSelectedIds([id]);
  };
  
  // ✅ 아이템 클릭 (선택 토글)
  const handleSelect = (id: number) => {
    setSelectedIds((prev) => 
        prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
    console.log("선택된 아이템 ID들:", selectedIds);
  };

  // ✅ 선택 모드에서 벗어나기
  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));

    // 만약 삭제한 아이템이 선택된 상태라면 선택 해제
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  // ✅ 선택 모드에서 벗어나기
  const cancelSelectMode = () => {
    setSelectedIds([]);
  };


  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen p-4 relative">
        <div className="mt-4 mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            나의 <span className="text-blue-600">냉장고</span>
          </h1>

          {/* ✅ 선택 모드일 때는 "취소" 버튼, 아닐 때는 "수정하기" 버튼 */}
          {isSelectMode && (
            <button
                onClick={cancelSelectMode}
                className="text-sm font-medium text-gray-500 hover:text-gray-800"
            >
                선택 취소
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categories.map((category) => {
            const active = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
                  active
                    ? "bg-green-700 text-white border-green-600"
                    : "bg-gray-100 text-gray-400 border-gray-100"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 pb-28">
          {filteredItems.map((item) => (
            <FridgeItemCard
              key={item.id}
              item={item}
              isSelectedMode={isSelectMode}
              isSelected={selectedIds.includes(item.id)}
              onSelect={handleSelect}
              onLongPress={handleLongPress}
              onDelete={handleDelete}
              onEditPress={handleOpenEdit}
             />
          ))}
        </div>

        {/* ✅ 추가 버튼 */}
        {!isSelectMode && (
          <button
            onClick={handleOpenAdd}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 ml-[140px] w-14 h-14 rounded-full bg-gray-200 text-3xl"
          >
            +
          </button>
        )}
        
        {/* ✅ 선택 모드에서 레시피 검색 버튼 */}
        {isSelectMode && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
            <div className="bg-green-700 text-white p-4 rounded-2xl flex justify-between items-center shadow-2xl">
              <span className="text-sm font-medium">{selectedIds.length}개의 재료로 레시피 검색하기</span>
              <button
                onClick={cancelSelectMode}
                className="text-white/70 text-sm"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* ✅ 모달 */}
        <AddIngredient
          isOpen={isModalOpen}
          mode={modalMode} // ✅ 핵심
          form={form}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          onChange={setForm}
        />

        <BottomNav />
      </div>
    </div>
  );
}