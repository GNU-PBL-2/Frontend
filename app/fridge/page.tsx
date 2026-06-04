"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Refrigerator, Plus, ArrowRight, ScanLine } from "lucide-react";
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
  const [memberId, setMemberId] = useState<number | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("전체");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingFridgeId, setEditingFridgeId] = useState<number | null>(null);
  const [form, setForm] = useState<FridgeForm>(INITIAL_FRIDGE_FORM);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const isSelectMode = selectedIds.length > 0;

  const router = useRouter();
  const { toastMessage, toastVisible, showToast } = useToast();

  useEffect(() => {
    async function load() {
      const memberId = getUserIdFromToken();
      if (!memberId) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      setMemberId(memberId);

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

  useEffect(() => {
    if (isEditMode && items.length === 0) exitEditMode();
  }, [items, isEditMode]);

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
    if (!memberId) return;
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
          memberId,
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
        setIsModalOpen(false);
        setForm(INITIAL_FRIDGE_FORM);
        setEditingFridgeId(null);
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
        setIsModalOpen(false);
        setForm(INITIAL_FRIDGE_FORM);
        setEditingFridgeId(null);
      } catch {
        showToast("재료 수정에 실패했어요");
      }
    }
  }

  async function handleDelete(fridgeId: number) {
    const snapshot = items;
    setItems((prev) => prev.filter((item) => item.fridgeId !== fridgeId));
    setSelectedIds((prev) => prev.filter((id) => id !== fridgeId));
    try {
      await deleteFridgeItem(fridgeId);
    } catch {
      setItems(snapshot);
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

  function enterEditMode() {
    if (items.length === 0) {
      showToast("수정할 재료가 없어요. 먼저 재료를 추가해 주세요.");
      return;
    }
    setSelectedIds([]);
    setIsEditMode(true);
  }

  function exitEditMode() {
    setSelectedIds([]);
    setIsEditMode(false);
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`선택한 ${selectedIds.length}개를 삭제할까요?`);
    if (!confirmed) return;
    const snapshot = items;
    const ids = [...selectedIds];
    setItems((prev) => prev.filter((item) => !ids.includes(item.fridgeId)));
    setSelectedIds([]);
    try {
      await Promise.all(ids.map((id) => deleteFridgeItem(id)));
      showToast(`${ids.length}개 삭제 완료`);
    } catch {
      setItems(snapshot);
      showToast("삭제에 실패했어요");
    }
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
    <div className="bg-[#F4F7EF] min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-gray-50 min-h-screen p-4 relative">
        <div className="bg-white -mx-4 -mt-4 mb-4 px-5 pt-10 pb-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-gray-950">나의 냉장고</h1>
            {isSelectMode && !isEditMode ? (
              <button
                onClick={cancelSelectMode}
                className="text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                선택 취소
              </button>
            ) : isEditMode ? (
              <button
                onClick={exitEditMode}
                className="text-sm font-semibold text-green-600 hover:text-green-700"
              >
                완료
              </button>
            ) : (
              <button
                onClick={enterEditMode}
                className="text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                수정하기
              </button>
            )}
          </div>
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
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center">
                <Refrigerator className="w-10 h-10 text-green-600" strokeWidth={1.4} />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-bold text-gray-700">냉장고가 비어있어요</p>
                <p className="text-[13px] text-gray-400 mt-1">재료를 추가해 보세요</p>
              </div>
              <div className="mt-2 flex flex-col items-center gap-2">
                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl
                    text-[14px] font-bold active:scale-95 transition-transform duration-150
                    shadow-[0_4px_14px_rgba(22,163,74,0.35)]"
                >
                  <Plus className="w-4 h-4" />
                  직접 추가하기
                </button>
                <button
                  onClick={() => router.push("/scan")}
                  className="flex items-center gap-2 bg-white border-2 border-green-600 text-green-700
                    px-6 py-3 rounded-2xl text-[14px] font-bold active:scale-95 transition-transform duration-150"
                >
                  <ScanLine className="w-4 h-4" />
                  카메라로 인식하기
                </button>
              </div>
            </div>
          ) : (
            filteredItems.map((item) => (
              <FridgeItemCard
                key={item.fridgeId}
                item={item}
                isSelectMode={isEditMode || isSelectMode}
                isSelected={selectedIds.includes(item.fridgeId)}
                onSelect={handleSelect}
                onLongPress={handleLongPress}
                onEditPress={handleOpenEdit}
              />
            ))
          )}
        </div>

        {/* 기본: FAB 버튼 영역 */}
        {!isSelectMode && !isEditMode && filteredItems.length > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {/* 카메라 인식 버튼 */}
            <button
              onClick={() => router.push("/scan")}
              className="flex items-center gap-2 bg-white border-2 border-green-600 text-green-700
                px-5 py-3.5 rounded-2xl text-[14px] font-bold
                shadow-[0_4px_16px_rgba(22,163,74,0.2)] active:scale-95 transition-transform duration-150"
            >
              <ScanLine className="w-5 h-5" />
              카메라 인식
            </button>
            {/* 직접 추가 버튼 */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-green-600 text-white
                px-5 py-3.5 rounded-2xl text-[14px] font-bold
                shadow-[0_4px_20px_rgba(22,163,74,0.4)] active:scale-95 transition-transform duration-150"
            >
              <Plus className="w-5 h-5" />
              직접 추가
            </button>
          </div>
        )}

        {/* 편집 모드 액션 바 */}
        {isEditMode && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl flex gap-3 items-center shadow-xl">
              {selectedIds.length > 0 ? (
                <button
                  onClick={() => setSelectedIds([])}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold active:scale-[0.97] transition-transform"
                >
                  선택 취소
                </button>
              ) : (
                <button
                  onClick={handleOpenAdd}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-bold active:scale-[0.97] transition-transform"
                >
                  + 추가
                </button>
              )}
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                className={`flex-1 py-3 rounded-xl text-sm font-bold active:scale-[0.97] transition-all
                  ${selectedIds.length > 0
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
              >
                {selectedIds.length > 0 ? `${selectedIds.length}개 삭제` : "삭제"}
              </button>
            </div>
          </div>
        )}

        {/* 레시피 검색 배너 (편집 모드 아닐 때만) */}
        {isSelectMode && !isEditMode && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
            {/* TODO: selectedIds(fridgeId) → ingredientId 변환 후 쿼리파라미터로 전달 (예: /recipe?ingredientIds=1,2,3)
                  백엔드 RecipeSearchRequest에 ingredientIds 파라미터 추가 필요 */}
            <button
              onClick={() => router.push("/recipe")}
              className="w-full bg-green-700 text-white p-4 rounded-2xl flex justify-between items-center shadow-2xl active:scale-[0.98] transition-transform duration-150"
            >
              <span className="text-sm font-medium">
                {selectedIds.length}개의 재료로 레시피 검색하기
              </span>
              <ArrowRight className="w-5 h-5 text-white/80" />
            </button>
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
