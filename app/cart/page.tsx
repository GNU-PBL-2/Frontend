"use client";

import React, { useState, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { ShoppingCart, Search, ArrowLeft, Plus, Minus, Refrigerator, Trash2, X } from "lucide-react";
import { fetchMasterIngredients, createFridgeItem, type MasterIngredient } from "@/lib/fridgeApi";

// ── 애니메이션 ────────────────────────────────────────────────────
const STYLES = `
  @keyframes item-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes check-pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.25); }
    100% { transform: scale(1); }
  }
  @keyframes view-in {
    from { opacity: 0; transform: translateX(18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .anim-item-in  { animation: item-in 0.35s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-view-in  { animation: view-in 0.28s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-fade-in  { animation: fade-in 0.2s ease both; }
`;

// ── 타입 ──────────────────────────────────────────────────────────
type CartItem = {
  id: number;
  name: string;
  quantity: number;
  checked: boolean;
};

type CartView = "cart" | "add";

// ── 스와이프 삭제 가능한 장바구니 카드 ───────────────────────────
function CartItemCard({
  item,
  index,
  onToggle,
  onQuantityChange,
  onDelete,
}: {
  item: CartItem;
  index: number;
  onToggle: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
  onDelete: (id: number) => void;
}) {
  const [isSwiped, setIsSwiped] = useState(false);
  const [checkAnim, setCheckAnim] = useState(false);
  const touchStartX = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setIsSwiped(true);
    if (diff < -30) setIsSwiped(false);
  }

  function handleToggle() {
    if (isSwiped) { setIsSwiped(false); return; }
    setCheckAnim(true);
    onToggle(item.id);
    setTimeout(() => setCheckAnim(false), 350);
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl anim-item-in"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      {/* 스와이프 삭제 */}
      <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-red-500 to-rose-400 rounded-r-2xl flex flex-col items-center justify-center gap-1">
        <button
          onClick={() => onDelete(item.id)}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="삭제"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">삭제</span>
        </button>
      </div>

      {/* 카드 */}
      <div
        className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200
          ${item.checked
            ? "bg-gray-50 border-gray-100"
            : "bg-white border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          }
          ${isSwiped ? "-translate-x-20" : "translate-x-0"}
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleToggle}
      >
        {/* 체크박스 */}
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200
            [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]
            ${checkAnim ? "scale-125" : "scale-100"}
            ${item.checked ? "bg-green-600 border-green-600" : "border-gray-300 bg-white"}
          `}
        >
          {item.checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* 이름 */}
        <p className={`flex-1 text-[15px] font-semibold truncate transition-colors duration-200
          ${item.checked ? "text-gray-400 line-through" : "text-gray-900"}`}
        >
          {item.name}
        </p>

        {/* 수량 컨트롤 */}
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onQuantityChange(item.id, -1)}
            className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center
              active:scale-90 transition-transform duration-100 text-gray-500"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[14px] font-bold text-gray-800 w-8 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.id, 1)}
            className="w-7 h-7 rounded-full border border-green-500 bg-green-50 flex items-center justify-center
              active:scale-90 transition-transform duration-100 text-green-600"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 드래프트 카드 (Add 뷰) ────────────────────────────────────────
function DraftItemCard({
  item,
  index,
  onChange,
}: {
  item: CartItem;
  index: number;
  onChange: (id: number, delta: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3.5
        shadow-[0_2px_12px_rgba(0,0,0,0.06)] anim-item-in"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
        <ShoppingCart className="w-4 h-4 text-amber-600" strokeWidth={2} />
      </div>
      <p className="flex-1 text-[15px] font-semibold text-gray-900 truncate">{item.name}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(item.id, -1)}
          className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center
            active:scale-90 transition-transform duration-100 text-gray-500"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-[14px] font-bold text-gray-800 w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onChange(item.id, 1)}
          className="w-7 h-7 rounded-full border border-amber-400 bg-amber-50 flex items-center justify-center
            active:scale-90 transition-transform duration-100 text-amber-600"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────
export default function CartPage() {
  const [view, setView] = useState<CartView>("cart");
  const [items, setItems] = useState<CartItem[]>([]);
  const [draftItems, setDraftItems] = useState<CartItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);
  const [addingToFridge, setAddingToFridge] = useState(false);

  const checkedItems = items.filter((i) => i.checked);
  const checkedCount = checkedItems.length;

  useEffect(() => {
    fetchMasterIngredients().then(setMasterIngredients).catch(() => {});
  }, []);

  // ── 헬퍼 ──
  function appendItem(target: CartItem[], name: string): CartItem[] {
    const existing = target.find((i) => i.name === name);
    if (existing) {
      return target.map((i) =>
        i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    }
    return [...target, { id: Date.now() + Math.random(), name, quantity: 1, checked: false }];
  }

  // ── cart 뷰 핸들러 ──
  function handleToggle(id: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  }

  function handleQuantityChange(id: number, delta: number) {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i];
        const next = i.quantity + delta;
        return next <= 0 ? [] : [{ ...i, quantity: next }];
      })
    );
  }

  function handleDelete(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleDeleteChecked() {
    if (checkedCount === 0) return;
    setItems((prev) => prev.filter((i) => !i.checked));
  }

  async function handleAddToFridge() {
    if (checkedCount === 0 || addingToFridge) return;
    setAddingToFridge(true);

    const defaultExpiry = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split("T")[0];
    })();

    const nameToIngredient = new Map(masterIngredients.map((m) => [m.name, m]));
    const succeeded: number[] = [];

    await Promise.allSettled(
      checkedItems.map(async (cartItem) => {
        const master = nameToIngredient.get(cartItem.name);
        if (!master) return;
        await createFridgeItem({
          ingredientId: master.ingredientId,
          quantity: cartItem.quantity,
          unit: "개",
          expiryDate: defaultExpiry,
        });
        succeeded.push(cartItem.id);
      })
    );

    if (succeeded.length > 0) {
      setItems((prev) => prev.filter((i) => !succeeded.includes(i.id)));
    }
    setAddingToFridge(false);
  }

  // ── add 뷰 핸들러 ──
  function handleAddDraftItem() {
    const name = searchKeyword.trim();
    if (!name) return;
    setDraftItems((prev) => appendItem(prev, name));
    setSearchKeyword("");
  }

  function handleDraftQuantityChange(id: number, delta: number) {
    setDraftItems((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i];
        const next = i.quantity + delta;
        return next <= 0 ? [] : [{ ...i, quantity: next }];
      })
    );
  }

  function handleCompleteAdd() {
    if (draftItems.length > 0) {
      setItems((prev) => {
        let next = [...prev];
        draftItems.forEach((d) => {
          for (let i = 0; i < d.quantity; i++) next = appendItem(next, d.name);
        });
        return next;
      });
    }
    setDraftItems([]);
    setSearchKeyword("");
    setView("cart");
  }

  function openAddView() {
    setDraftItems([]);
    setSearchKeyword("");
    setView("add");
  }

  // ── 렌더 ──
  return (
    <>
      <style>{STYLES}</style>
      <div className="flex min-h-screen justify-center bg-gray-50">
        <div className="w-full max-w-sm bg-gray-50 min-h-screen flex flex-col">

          {/* ── 헤더 ── */}
          <div className="bg-white px-5 pt-10 pb-4 shadow-[0_1px_0_rgba(0,0,0,0.06)] shrink-0">
            {view === "add" ? (
              <div className="flex items-center gap-3 anim-view-in">
                <button
                  onClick={() => setView("cart")}
                  className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center
                    active:scale-90 transition-transform duration-150"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-extrabold text-gray-950">재료 추가</h1>
              </div>
            ) : (
              <div className="flex items-center justify-between anim-view-in">
                <h1 className="text-xl font-extrabold text-gray-950">장바구니</h1>
                {items.length > 0 && (
                  <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-[12px] font-bold px-3 py-1 rounded-full border border-green-200">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {items.length}개
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── 본문 ── */}
          <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">

            {/* === ADD 뷰 === */}
            {view === "add" && (
              <div className="space-y-4 anim-view-in">
                {/* 검색 인풋 */}
                <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3
                  shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus-within:border-green-500 transition-colors duration-200">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddDraftItem()}
                    placeholder="재료명을 입력하세요"
                    className="flex-1 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                    autoFocus
                  />
                  {searchKeyword && (
                    <button onClick={() => setSearchKeyword("")} className="text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 드래프트 아이템 */}
                {draftItems.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[12px] font-semibold text-gray-400 px-1">추가할 재료 목록</p>
                    {draftItems.map((item, i) => (
                      <DraftItemCard
                        key={item.id}
                        item={item}
                        index={i}
                        onChange={handleDraftQuantityChange}
                      />
                    ))}
                  </div>
                )}

                {/* 빈 상태 (아무것도 없을 때) */}
                {draftItems.length === 0 && !searchKeyword && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 anim-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
                    </div>
                    <p className="text-[14px] text-gray-400 font-medium">재료명을 검색해서 추가하세요</p>
                  </div>
                )}
              </div>
            )}

            {/* === CART 뷰 === */}
            {view === "cart" && (
              <>
                {items.length === 0 ? (
                  /* 빈 상태 */
                  <div className="flex flex-col items-center justify-center py-24 gap-4 anim-fade-in">
                    <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-green-600" strokeWidth={1.4} />
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-gray-700">장바구니가 비어있어요</p>
                      <p className="text-[13px] text-gray-400 mt-1">필요한 재료를 추가해 보세요</p>
                    </div>
                    <button
                      onClick={openAddView}
                      className="mt-2 flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl
                        text-[14px] font-bold active:scale-95 transition-transform duration-150
                        shadow-[0_4px_14px_rgba(22,163,74,0.35)]"
                    >
                      <Plus className="w-4 h-4" />
                      재료 추가하기
                    </button>
                  </div>
                ) : (
                  /* 아이템 목록 */
                  <div className="space-y-3 anim-view-in">
                    {/* 선택 상태 요약 */}
                    {checkedCount > 0 && (
                      <div className="flex items-center justify-between px-1 anim-fade-in">
                        <span className="text-[13px] font-semibold text-green-700">
                          {checkedCount}개 선택됨
                        </span>
                        <button
                          onClick={() => setItems((prev) => prev.map((i) => ({ ...i, checked: false })))}
                          className="text-[12px] text-gray-400 active:text-gray-700"
                        >
                          선택 해제
                        </button>
                      </div>
                    )}

                    {items.map((item, i) => (
                      <CartItemCard
                        key={item.id}
                        item={item}
                        index={i}
                        onToggle={handleToggle}
                        onQuantityChange={handleQuantityChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── 하단 액션바 ── */}
          <div className="shrink-0 px-4 pb-24 pt-2 space-y-2">
            {view === "add" ? (
              /* Add 뷰 버튼 */
              <>
                <button
                  onClick={handleAddDraftItem}
                  disabled={!searchKeyword.trim()}
                  className="w-full py-3.5 rounded-2xl border-2 border-amber-400 bg-amber-50 text-amber-700
                    text-[14px] font-bold transition-all duration-150 active:scale-[0.97]
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  장바구니에 담기
                </button>
                <button
                  onClick={handleCompleteAdd}
                  className="w-full py-3.5 rounded-2xl bg-green-600 text-white text-[14px] font-bold
                    active:scale-[0.97] transition-transform duration-150
                    shadow-[0_4px_14px_rgba(22,163,74,0.3)]"
                >
                  완료
                </button>
              </>
            ) : checkedCount > 0 ? (
              /* 선택 상태 버튼 */
              <div className="flex gap-2">
                <button
                  onClick={handleAddToFridge}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                    bg-green-600 text-white text-[13px] font-bold
                    active:scale-[0.97] transition-transform duration-150
                    shadow-[0_4px_14px_rgba(22,163,74,0.3)]"
                >
                  <Refrigerator className="w-4 h-4" />
                  냉장고에 추가
                </button>
                <button
                  onClick={handleDeleteChecked}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                    bg-white border border-gray-200 text-red-500 text-[13px] font-bold
                    active:scale-[0.97] transition-transform duration-150 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              </div>
            ) : (
              /* 기본 버튼 */
              <button
                onClick={openAddView}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                  bg-white border border-gray-200 text-gray-700 text-[14px] font-bold
                  active:scale-[0.97] transition-transform duration-150 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                품목 추가하기
              </button>
            )}
          </div>

          <BottomNav />
        </div>
      </div>
    </>
  );
}
