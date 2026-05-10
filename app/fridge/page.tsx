"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import IngredientModal from "@/components/fridge/IngredientModal";
import FridgeItemCard from "@/components/fridge/FridgeItemCard";
import {
  FridgeItem,
  FridgeForm,
  MasterIngredient,
  INITIAL_FRIDGE_FORM,
  fetchFridgeList,
  fetchMasterIngredients,
  createFridgeItem,
  updateFridgeItem,
  deleteFridgeItem,
} from "@/lib/fridgeApi";
import { getUserIdFromToken } from "@/utils/auth";
import { getDaysLeft } from "@/utils/expiryHelpers";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";

type FilterCategory = "전체" | "채소" | "육류" | "유제품" | "기타";
const CATEGORIES: FilterCategory[] = ["전체", "채소", "육류", "유제품", "기타"];

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border-2 border-gray-100 bg-white px-4 py-4 animate-pulse">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="h-3 w-20 rounded bg-gray-100" />
            </div>
            <div className="h-8 w-14 rounded-xl bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FridgePage() {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("전체");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingFridgeId, setEditingFridgeId] = useState<number | null>(null);
  const [form, setForm] = useState<FridgeForm>(INITIAL_FRIDGE_FORM);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const isSelectMode = selectedIds.length > 0;

  const { toastMessage, toastVisible, showToast } = useToast();

  useEffect(() => {
    async function load() {
      const memberId = getUserIdFromToken();
      if (!memberId) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      const [fridgeResult, masterResult] = await Promise.allSettled([
        fetchFridgeList(memberId),
        fetchMasterIngredients(),
      ]);

      let master: MasterIngredient[] = [];
      if (masterResult.status === "fulfilled") {
        master = masterResult.value;
        setMasterIngredients(master);
      }

      if (fridgeResult.status === "fulfilled") {
        const categoryMap = new Map(master.map((m) => [m.ingredientId, m.categoryName]));
        const enriched = fridgeResult.value.map((item) => ({
          ...item,
          categoryName: categoryMap.get(item.ingredientId) ?? "",
        }));
        setItems(enriched);
      }

      setLoading(false);
    }

    load();
  }, []);

  const filteredItems = useMemo(() => {
    const filtered =
      selectedCategory === "전체"
        ? items
        : items.filter((item) => item.categoryName === selectedCategory);

    return [...filtered].sort((a, b) => getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate));
  }, [items, selectedCategory]);

  function handleOpenAdd() {
    setModalMode("add");
    setForm(INITIAL_FRIDGE_FORM);
    setEditingFridgeId(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(item: FridgeItem) {
    setModalMode("edit");
    setEditingFridgeId(item.fridgeId);
    setForm({
      selectedIngredientId: item.ingredientId,
      selectedIngredientName: item.ingredientName,
      selectedCategoryName: item.categoryName,
      ingredientSearch: item.ingredientName,
      expiryDate: item.expiryDate,
      quantity: String(item.quantity),
      unit: item.unit,
    });
    setIsModalOpen(true);
  }

  async function handleSaveItem() {
    if (!form.expiryDate) {
      alert("유통기한을 입력해 주세요.");
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      alert("수량을 1 이상 입력해 주세요.");
      return;
    }

    const qty = Number(form.quantity);

    if (modalMode === "add") {
      if (!form.selectedIngredientId) {
        alert("재료를 검색해서 선택해 주세요.");
        return;
      }

      try {
        const created = await createFridgeItem({
          ingredientId: form.selectedIngredientId,
          quantity: qty,
          unit: form.unit,
          expiryDate: form.expiryDate,
        });
        const enriched: FridgeItem = {
          ...created,
          categoryName: form.selectedCategoryName,
        };
        setItems((prev) => [enriched, ...prev]);
        showToast(`${form.selectedIngredientName} 추가 완료`);
      } catch {
        showToast("재료 추가에 실패했어요");
      }
    } else if (editingFridgeId !== null) {
      try {
        await updateFridgeItem(editingFridgeId, {
          quantity: qty,
          unit: form.unit,
          expiryDate: form.expiryDate,
        });
        setItems((prev) =>
          prev.map((item) =>
            item.fridgeId === editingFridgeId
              ? { ...item, quantity: qty, unit: form.unit, expiryDate: form.expiryDate }
              : item
          )
        );
        showToast("수정 완료");
      } catch {
        showToast("재료 수정에 실패했어요");
      }
    }

    setIsModalOpen(false);
    setForm(INITIAL_FRIDGE_FORM);
    setEditingFridgeId(null);
  }

  async function handleDelete(fridgeId: number) {
    setItems((prev) => prev.filter((item) => item.fridgeId !== fridgeId));
    setSelectedIds((prev) => prev.filter((id) => id !== fridgeId));
    try {
      await deleteFridgeItem(fridgeId);
    } catch {
      showToast("삭제에 실패했어요");
    }
  }

  function handleLongPress(fridgeId: number) {
    setSelectedIds([fridgeId]);
  }

  function handleSelect(fridgeId: number) {
    setSelectedIds((prev) =>
      prev.includes(fridgeId) ? prev.filter((id) => id !== fridgeId) : [...prev, fridgeId]
    );
  }

  function cancelSelectMode() {
    setSelectedIds([]);
  }

  if (authError) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex items-center justify-center">
          <p className="text-sm text-gray-500">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen p-4 relative">
        <div className="mt-4 mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            나의 <span className="text-blue-600">냉장고</span>
          </h1>
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
          {CATEGORIES.map((category) => {
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
          {loading ? (
            <LoadingSkeleton />
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-gray-400">냉장고가 비어있어요.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <FridgeItemCard
                key={item.fridgeId}
                item={item}
                isSelectMode={isSelectMode}
                isSelected={selectedIds.includes(item.fridgeId)}
                onSelect={handleSelect}
                onLongPress={handleLongPress}
                onDelete={handleDelete}
                onEditPress={handleOpenEdit}
              />
            ))
          )}
        </div>

        {/* 추가 버튼 */}
        {!isSelectMode && (
          <button
            onClick={handleOpenAdd}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 ml-[140px] w-14 h-14 rounded-full bg-gray-200 text-3xl"
          >
            +
          </button>
        )}

        {/* 선택 모드 레시피 검색 배너 */}
        {isSelectMode && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
            <div className="bg-green-700 text-white p-4 rounded-2xl flex justify-between items-center shadow-2xl">
              <span className="text-sm font-medium">
                {selectedIds.length}개의 재료로 레시피 검색하기
              </span>
              <button onClick={cancelSelectMode} className="text-white/70 text-sm">
                취소
              </button>
            </div>
          </div>
        )}

        <IngredientModal
          isOpen={isModalOpen}
          mode={modalMode}
          form={form}
          masterIngredients={masterIngredients}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          onChange={setForm}
          onDelete={() => {
            if (editingFridgeId !== null) handleDelete(editingFridgeId);
          }}
        />

        <Toast message={toastMessage} visible={toastVisible} />
        <BottomNav />
      </div>
    </div>
  );
}
