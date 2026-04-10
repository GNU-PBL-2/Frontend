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
  category: "채소",
  quantity: "보통",
  quantityValue: "",
  favorite: false,
};

export default function FridgePage() {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("전체");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const [items, setItems] = useState<Ingredient[]>(mockIngredients);
  const [form, setForm] = useState<IngredientForm>(INITIAL_FORM);

  const [isEditMode, setIsEditMode] = useState(false);

  const filteredItems = useMemo(() => {
    const filtered =
      selectedCategory === "전체"
        ? items
        : items.filter((item) => item.category === selectedCategory);

    return [...filtered].sort(
      (a, b) =>
        getDaysLeft(a.purchaseDate, a.category) -
        getDaysLeft(b.purchaseDate, b.category)
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
      category: item.category,
      quantity: item.quantity,
      quantityValue: item.quantityValue ? String(item.quantityValue) : "",
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

  const quantityOrder: Quantity[] = ["적음", "보통", "많음"];

  const increaseItemQuantity = (id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (item.quantityValue !== undefined) {
          return { ...item, quantityValue: item.quantityValue + 1 };
        }

        const currentIndex = quantityOrder.indexOf(item.quantity);
        const nextIndex = Math.min(currentIndex + 1, quantityOrder.length - 1);

        return { ...item, quantity: quantityOrder[nextIndex] };
      })
    );
  };

  const decreaseItemQuantity = (id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (item.quantityValue !== undefined) {
          const nextValue = Math.max(1, item.quantityValue - 1);
          return { ...item, quantityValue: nextValue };
        }

        const currentIndex = quantityOrder.indexOf(item.quantity);
        const nextIndex = Math.max(currentIndex - 1, 0);

        return { ...item, quantity: quantityOrder[nextIndex] };
      })
    );
  };

  const toggleFavorite = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen p-4 relative">
        <div className="mt-4 mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            나의 <span className="text-blue-600">냉장고</span>
          </h1>
          <button
            onClick={() => setIsEditMode((prev) => !prev)}
            className="text-sm font-medium text-green-600"
          >
            {isEditMode ? "저장하기" : "수정하기"}
          </button>
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
              onToggleFavorite={toggleFavorite}
              isEditMode={isEditMode}
              onIncrease={increaseItemQuantity}
              onDecrease={decreaseItemQuantity}
              onEdit={handleOpenEdit} // ✅ 추가
            />
          ))}
        </div>

        {/* ✅ 추가 버튼 */}
        <button
          onClick={handleOpenAdd}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 ml-[140px] w-14 h-14 rounded-full bg-gray-200 text-3xl"
        >
          +
        </button>

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