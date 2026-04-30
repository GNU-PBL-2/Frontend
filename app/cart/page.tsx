"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";

type CartView = "cart" | "add";

type CartItem = {
  id: number;
  name: string;
  quantity: number;
  unit: "개";
  checked: boolean;
};

const initialItems: CartItem[] = [];

export default function CartPage() {
  const [view, setView] = useState<CartView>("cart");
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [draftItems, setDraftItems] = useState<CartItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [newItemName, setNewItemName] = useState("");

  const appendItem = (target: CartItem[], name: string) => {
    const existingItem = target.find((item) => item.name === name);

      if (existingItem) {
        return target.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

    return [
      ...target,
        {
          id: Date.now() + Math.random(),
          name,
          quantity: 1,
          unit: "개",
          checked: false,
        },
      ];
  };

  const handleAddDraftItem = () => {
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;

    setDraftItems((prev) => appendItem(prev, trimmedName));
    setSearchKeyword("");
    setNewItemName("");
  };

  const handleDraftQuantityChange = (id: number, delta: number) => {
    setDraftItems((prev) =>
      prev.flatMap((item) => {
        if (item.id !== id) return [item];

        const nextQuantity = item.quantity + delta;
        if (nextQuantity <= 0) return [];

        return [{ ...item, quantity: nextQuantity }];
      })
    );
  };

  const handleCompleteAdd = () => {
    if (draftItems.length > 0) {
      setItems((prev) => {
        let nextItems = [...prev];

        draftItems.forEach((draftItem) => {
          for (let i = 0; i < draftItem.quantity; i += 1) {
            nextItems = appendItem(nextItems, draftItem.name);
          }
        });

        return nextItems;
      });
    }

    setDraftItems([]);
    setSearchKeyword("");
    setNewItemName("");
    setView("cart");
  };

  const handleToggleChecked = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDeleteChecked = () => {
    const checkedItems = items.filter((item) => item.checked);
    if (checkedItems.length === 0) return;

    setItems((prev) => prev.filter((item) => !item.checked));
  };

  const handleAddToFridge = () => {
    const checkedItems = items.filter((item) => item.checked);
    if (checkedItems.length === 0) return;

    setItems((prev) => prev.filter((item) => !item.checked));
  };

  const openAddView = () => {
    setSearchKeyword("");
    setNewItemName("");
    setDraftItems([]);
    setView("add");
  };

  const renderItemCard = (item: CartItem, withCheckButton: boolean) => (
    <div
      key={item.id}
      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
    >
      <div className="h-14 w-14 shrink-0 rounded-md border border-gray-300 bg-gray-50" />

      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold text-gray-900">{item.name}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-green-700">
          {item.quantity}
          {item.unit}
        </span>
        {withCheckButton ? (
          <button
            onClick={() => handleToggleChecked(item.id)}
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
              item.checked
                ? "border-gray-300 bg-white text-gray-900"
                : "border-gray-200 bg-gray-100 text-gray-300"
            }`}
            aria-label={`${item.name} 선택`}
          >
            ✓
          </button>
        ) : null}
      </div>
    </div>
  );

  const renderDraftItemCard = (item: CartItem) => (
    <div
      key={item.id}
      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
    >
      <div className="h-14 w-14 shrink-0 rounded-md border border-gray-300 bg-gray-50" />

      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold text-gray-900">{item.name}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDraftQuantityChange(item.id, -1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700"
          aria-label={`${item.name} 수량 감소`}
        >
          -
        </button>
        <span className="min-w-[2.5rem] text-center text-sm font-semibold text-green-700">
          {item.quantity}
          {item.unit}
        </span>
        <button
          onClick={() => handleDraftQuantityChange(item.id, 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700"
          aria-label={`${item.name} 수량 증가`}
        >
          +
        </button>
      </div>
    </div>
  );

  const renderCartView = () => {
    if (items.length === 0) {
      return (
        <div className="flex min-h-[68vh] flex-col">
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-gray-500">
              장바구니에 담은 품목이 없습니다.
            </p>
          </div>

          <div className="mt-auto space-y-3 pb-1 pt-12">
            <button
              onClick={handleAddToFridge}
              className="w-full rounded-md border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm"
            >
              선택 항목 냉장고에 추가하기
            </button>
            <button
              onClick={handleDeleteChecked}
              className="w-full rounded-md border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm"
            >
              선택 항목 삭제하기
            </button>
            <button
              onClick={openAddView}
              className="w-full rounded-md border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm"
            >
              품목 추가하기
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-[68vh] flex-col">
        <div className="space-y-4">{items.map((item) => renderItemCard(item, true))}</div>

        <div className="mt-auto space-y-3 pb-1 pt-12">
          <button
            onClick={handleAddToFridge}
            className="w-full rounded-md border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm"
          >
            선택 항목 냉장고에 추가하기
          </button>
          <button
            onClick={handleDeleteChecked}
            className="w-full rounded-md border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm"
          >
            선택 항목 삭제하기
          </button>
          <button
            onClick={openAddView}
            className="w-full rounded-md border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm"
          >
            품목 추가하기
          </button>
        </div>
      </div>
    );
  };

  const renderAddView = () => (
    <div className="flex min-h-[68vh] flex-col">
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <input
          type="text"
          value={searchKeyword}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSearchKeyword(nextValue);
            setNewItemName(nextValue.trim());
          }}
          placeholder="식재료 검색"
          className="w-full border-none text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      {draftItems.length > 0 ? (
        <div className="mt-8 space-y-4">
          {draftItems.map((item) => renderDraftItemCard(item))}
        </div>
      ) : null}

      <div className="mt-auto space-y-3 pb-1 pt-12">
        <button
          onClick={handleAddDraftItem}
          className="w-full rounded-md border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm"
        >
          장바구니에 담기
        </button>
        <button
          onClick={handleCompleteAdd}
          className="w-full rounded-md border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm"
        >
          완료
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="min-h-screen w-full max-w-sm bg-white px-5 pt-8 pb-28">
        <h1 className="text-xl font-extrabold text-gray-950">장바구니</h1>

        <section className="mt-8">
          {view === "cart" ? renderCartView() : renderAddView()}
        </section>

        <BottomNav />
      </div>
    </div>
  );
}
