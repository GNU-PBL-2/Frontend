"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BottomNav from "@/components/BottomNav";
import {
  ShoppingCart, Search, ArrowLeft, Plus, Minus, Refrigerator,
  Trash2, X, ExternalLink, CheckSquare, Square,
} from "lucide-react";
import {
  CartItem,
  fetchCartItems,
  addCartItems,
  updateCartItem,
  deleteCartItem,
  deleteCartItems,
} from "@/lib/cartApi";
import { fetchMasterIngredients, createFridgeItem, type MasterIngredient } from "@/lib/fridgeApi";
import { getUserIdFromToken } from "@/utils/auth";
import { openShoppingSearch } from "@/utils/shopping";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";

const STYLES = `
  @keyframes item-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
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

type DraftItem = { tempId: number; name: string; quantity: number };
type CartView = "cart" | "add";

// ── 장바구니 카드 ────────────────────────────────────────────────
function CartItemCard({
  item,
  index,
  onToggle,
  onQuantityChange,
  onDelete,
}: {
  item: CartItem;
  index: number;
  onToggle: (id: number, checked: boolean) => void;
  onQuantityChange: (id: number, newQty: number) => void;
  onDelete: (id: number) => void;
}) {
  const [checkAnim, setCheckAnim] = useState(false);

  function handleToggle() {
    setCheckAnim(true);
    onToggle(item.cartItemId, !item.isChecked);
    setTimeout(() => setCheckAnim(false), 350);
  }

  return (
    <div
      className="relative rounded-2xl anim-item-in"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div
        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border transition-all duration-200 ${
          item.isChecked
            ? "bg-gray-50 border-gray-100"
            : "bg-white border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        }`}
      >
        {/* 체크박스 */}
        <button
          onClick={handleToggle}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200
            [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]
            ${checkAnim ? "scale-125" : "scale-100"}
            ${item.isChecked ? "bg-green-600 border-green-600" : "border-gray-300 bg-white"}
          `}
        >
          {item.isChecked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* 이름 + 쇼핑 링크 */}
        <div className="flex-1 flex items-center gap-1 min-w-0">
          <p
            className={`text-[14px] font-semibold truncate transition-colors duration-200 ${
              item.isChecked ? "text-gray-400 line-through" : "text-gray-900"
            }`}
          >
            {item.name}
          </p>
          {item.unit && (
            <span className="text-[11px] text-gray-400 shrink-0">{item.unit}</span>
          )}
          {/* 미구매 아이템: 온라인 구매 링크 */}
          {!item.isChecked && (
            <button
              onClick={() => openShoppingSearch(item.name)}
              className="shrink-0 ml-0.5 text-gray-300 active:text-blue-400 transition-colors"
              aria-label={`${item.name} 온라인에서 구매`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 수량 컨트롤 */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onQuantityChange(item.cartItemId, item.quantity - 1)}
            className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center
              active:scale-90 transition-transform duration-100 text-gray-500"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[14px] font-bold text-gray-800 w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.cartItemId, item.quantity + 1)}
            className="w-7 h-7 rounded-full border border-green-500 bg-green-50 flex items-center justify-center
              active:scale-90 transition-transform duration-100 text-green-600"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* 개별 삭제 */}
        <button
          onClick={() => onDelete(item.cartItemId)}
          className="shrink-0 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center
            active:bg-red-100 active:scale-90 transition-all duration-100 text-red-400"
          aria-label={`${item.name} 삭제`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
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
  item: DraftItem;
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
          onClick={() => onChange(item.tempId, -1)}
          className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center
            active:scale-90 transition-transform duration-100 text-gray-500"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-[14px] font-bold text-gray-800 w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onChange(item.tempId, 1)}
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
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);
  const [addingToFridge, setAddingToFridge] = useState(false);
  const { toastMessage, toastVisible, showToast } = useToast();

  const quantityTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const checkedItems = items.filter((i) => i.isChecked);
  const checkedCount = checkedItems.length;
  const allChecked = items.length > 0 && items.every((i) => i.isChecked);

  const loadCart = useCallback(async () => {
    setIsLoadingCart(true);
    try {
      const data = await fetchCartItems();
      setItems(data);
    } catch {
      showToast("장바구니를 불러오지 못했어요");
    } finally {
      setIsLoadingCart(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCart();
    fetchMasterIngredients().then(setMasterIngredients).catch(() => {});
  }, [loadCart]);

  // ── cart 뷰 핸들러 ──

  async function handleToggle(cartItemId: number, isChecked: boolean) {
    setItems((prev) => prev.map((i) => (i.cartItemId === cartItemId ? { ...i, isChecked } : i)));
    try {
      await updateCartItem(cartItemId, { isChecked });
    } catch {
      setItems((prev) => prev.map((i) => (i.cartItemId === cartItemId ? { ...i, isChecked: !isChecked } : i)));
      showToast("상태 변경에 실패했어요");
    }
  }

  async function handleToggleAll() {
    const target = !allChecked;
    setItems((prev) => prev.map((i) => ({ ...i, isChecked: target })));
    await Promise.allSettled(items.map((i) => updateCartItem(i.cartItemId, { isChecked: target })));
  }

  function handleQuantityChange(cartItemId: number, newQty: number) {
    if (newQty <= 0) {
      handleDelete(cartItemId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: newQty } : i)));
    clearTimeout(quantityTimers.current[cartItemId]);
    quantityTimers.current[cartItemId] = setTimeout(async () => {
      try {
        await updateCartItem(cartItemId, { quantity: newQty });
      } catch {
        showToast("수량 변경에 실패했어요");
        loadCart();
      }
    }, 500);
  }

  async function handleDelete(cartItemId: number) {
    const snapshot = items;
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    try {
      await deleteCartItem(cartItemId);
    } catch {
      setItems(snapshot);
      showToast("삭제에 실패했어요");
    }
  }

  async function handleDeleteChecked() {
    if (checkedCount === 0) return;
    const ids = checkedItems.map((i) => i.cartItemId);
    const snapshot = items;
    setItems((prev) => prev.filter((i) => !i.isChecked));
    try {
      await deleteCartItems(ids);
      showToast(`${ids.length}개를 삭제했어요`);
    } catch {
      setItems(snapshot);
      showToast("삭제에 실패했어요");
    }
  }

  async function handleAddToFridge() {
    if (checkedCount === 0 || addingToFridge) return;
    const memberId = getUserIdFromToken();
    if (!memberId) { showToast("로그인이 필요합니다"); return; }

    setAddingToFridge(true);
    const defaultExpiry = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split("T")[0];
    })();

    const nameToIngredient = new Map(masterIngredients.map((m) => [m.name, m]));
    const succeeded: number[] = [];
    const missing: string[] = [];

    await Promise.allSettled(
      checkedItems.map(async (cartItem) => {
        const ingredientId = cartItem.ingredientId ?? nameToIngredient.get(cartItem.name)?.ingredientId;
        if (!ingredientId) { missing.push(cartItem.name); return; }
        await createFridgeItem({
          memberId,
          ingredientId,
          quantity: cartItem.quantity,
          unit: cartItem.unit ?? "개",
          expiryDate: defaultExpiry,
        });
        succeeded.push(cartItem.cartItemId);
      })
    );

    if (succeeded.length > 0) {
      setItems((prev) => prev.filter((i) => !succeeded.includes(i.cartItemId)));
      await deleteCartItems(succeeded).catch(() => {});
      showToast(`${succeeded.length}개를 냉장고에 추가했어요`);
    }
    if (missing.length > 0) {
      showToast(`${missing.join(", ")}은/는 등록된 재료가 아니에요`);
    }
    setAddingToFridge(false);
  }

  // ── add 뷰 핸들러 ──

  // 마스터 재료 자동완성: 2글자 이상 입력 시 최대 8개 추천
  const suggestions: MasterIngredient[] =
    searchKeyword.trim().length >= 1
      ? masterIngredients
          .filter((m) => m.name.includes(searchKeyword.trim()))
          .slice(0, 8)
      : [];

  function addToDraft(name: string) {
    setDraftItems((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (existing) {
        return prev.map((i) => (i.name === name ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { tempId: Date.now(), name, quantity: 1 }];
    });
    setSearchKeyword("");
  }

  function handleAddDraftItem() {
    const name = searchKeyword.trim();
    if (!name) return;
    addToDraft(name);
  }

  function handleDraftQuantityChange(tempId: number, delta: number) {
    setDraftItems((prev) =>
      prev.flatMap((i) => {
        if (i.tempId !== tempId) return [i];
        const next = i.quantity + delta;
        return next <= 0 ? [] : [{ ...i, quantity: next }];
      })
    );
  }

  async function handleCompleteAdd() {
    if (draftItems.length > 0) {
      try {
        const added = await addCartItems(
          draftItems.map((d) => ({ name: d.name, quantity: d.quantity }))
        );
        setItems((prev) => {
          const updatedNames = new Set(added.map((a) => a.name));
          return [...prev.filter((i) => !updatedNames.has(i.name)), ...added];
        });
        showToast(`${draftItems.length}개 재료를 추가했어요`);
      } catch {
        showToast("추가에 실패했어요");
      }
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
      <div className="flex min-h-screen justify-center bg-white">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">

          {/* ── 헤더 ── */}
          <div className="bg-white/[0.94] backdrop-blur-sm px-5 pt-10 pb-4 shadow-[0_1px_0_#E6ECDF] shrink-0">
            {view === "add" ? (
              <div className="flex items-center gap-3 anim-view-in">
                <button
                  onClick={() => setView("cart")}
                  className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-90 transition-transform duration-150"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="font-extrabold" style={{ fontSize: 27, color: "#16201A" }}>재료 추가</h1>
              </div>
            ) : (
              <div className="flex items-center justify-between anim-view-in">
                <h1 className="font-extrabold" style={{ fontSize: 27, color: "#16201A" }}>장바구니</h1>
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
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">

            {/* === ADD 뷰 === */}
            {view === "add" && (
              <div className="space-y-4 anim-view-in">
                {/* 검색 입력 */}
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

                {/* 자동완성 추천 */}
                {suggestions.length > 0 && (
                  <div className="anim-fade-in">
                    <p className="text-[11px] font-semibold text-gray-400 px-1 mb-2">추천 재료</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((m) => (
                        <button
                          key={m.ingredientId}
                          onClick={() => addToDraft(m.name)}
                          className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700
                            rounded-full text-[13px] font-semibold active:bg-green-100 active:scale-95
                            transition-all duration-100"
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 직접 추가 버튼 — 추천 목록에 없는 재료명 입력 시 */}
                {searchKeyword.trim() && suggestions.every((s) => s.name !== searchKeyword.trim()) && (
                  <button
                    onClick={handleAddDraftItem}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                      border-2 border-dashed border-amber-300 bg-amber-50 text-amber-700
                      text-[14px] font-semibold active:scale-[0.98] transition-transform duration-100 anim-fade-in"
                  >
                    <Plus className="w-4 h-4" />
                    &quot;{searchKeyword.trim()}&quot; 직접 추가
                  </button>
                )}

                {/* 추가할 재료 목록 */}
                {draftItems.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[12px] font-semibold text-gray-400 px-1">추가할 재료 목록 ({draftItems.length})</p>
                    {draftItems.map((item, i) => (
                      <DraftItemCard
                        key={item.tempId}
                        item={item}
                        index={i}
                        onChange={handleDraftQuantityChange}
                      />
                    ))}
                  </div>
                )}

                {/* 빈 상태 */}
                {draftItems.length === 0 && !searchKeyword && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 anim-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
                    </div>
                    <p className="text-[14px] text-gray-400 font-medium text-center">
                      재료명을 검색하거나<br />직접 입력하세요
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* === CART 뷰 === */}
            {view === "cart" && (
              <>
                {isLoadingCart ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 rounded-2xl skeleton" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
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
                  <div className="space-y-3 anim-view-in">
                    {/* 전체 선택 / 선택 정보 바 */}
                    <div className="flex items-center justify-between px-1">
                      <button
                        onClick={handleToggleAll}
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 active:text-green-700 transition-colors"
                      >
                        {allChecked
                          ? <CheckSquare className="w-4 h-4 text-green-600" />
                          : <Square className="w-4 h-4" />
                        }
                        전체 선택
                      </button>
                      {checkedCount > 0 ? (
                        <span className="text-[13px] font-semibold text-green-700">
                          {checkedCount}개 선택됨
                        </span>
                      ) : (
                        <span className="text-[12px] text-gray-400">
                          항목을 체크하면 냉장고에 담을 수 있어요
                        </span>
                      )}
                    </div>

                    {items.map((item, i) => (
                      <CartItemCard
                        key={item.cartItemId}
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
              <>
                <button
                  onClick={handleCompleteAdd}
                  disabled={draftItems.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-green-600 text-white text-[14px] font-bold
                    active:scale-[0.97] transition-all duration-150
                    shadow-[0_4px_14px_rgba(22,163,74,0.3)]
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {draftItems.length > 0 ? `${draftItems.length}개 장바구니에 추가` : "재료를 선택하세요"}
                </button>
              </>
            ) : checkedCount > 0 ? (
              <div className="flex gap-2">
                <button
                  onClick={handleAddToFridge}
                  disabled={addingToFridge}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                    bg-green-600 text-white text-[13px] font-bold
                    active:scale-[0.97] transition-transform duration-150
                    shadow-[0_4px_14px_rgba(22,163,74,0.3)] disabled:opacity-60"
                >
                  <Refrigerator className="w-4 h-4" />
                  {addingToFridge ? "추가 중..." : `냉장고에 담기 (${checkedCount})`}
                </button>
                <button
                  onClick={handleDeleteChecked}
                  className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl
                    bg-white border border-gray-200 text-red-500 text-[13px] font-bold
                    active:scale-[0.97] transition-transform duration-150 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
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
          <Toast message={toastMessage} visible={toastVisible} />
        </div>
      </div>
    </>
  );
}
