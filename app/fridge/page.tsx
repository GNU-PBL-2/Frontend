"use client";

import { useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import AddIngredient from "@/components/fridge/AddIngredient";
import FridgeItemCard from "@/components/fridge/FridgeItemCard";
import { mockIngredients, type Ingredient, type Category, type Quantity } from "@/data/dummydata";
import { getDaysLeft } from "@/utils/expiryHelpers";

type FilterCategory = "전체" | "채소" | Category;

type IngredientForm = {
  name: string;
  purchaseDate: string;
  category: Category;
  quantity: Quantity;
  quantityValue: string;
  favorite: boolean;
};

const categories: FilterCategory[] = ["전체", "채소", "육류", "유제품", "기타"];

const initialForm: {
  name: string;
  purchaseDate: string;
  category: Category;
  quantity: Quantity;
  quantityValue: string;
  favorite: boolean;
} = {
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

    const [items, setItems] = useState<Ingredient[]>(mockIngredients);

    const [form, setForm] = useState<IngredientForm>(initialForm);

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

    const handleSaveItem = () => {
        if (!form.name.trim() || !form.purchaseDate) {
        alert("재료명과 구매일자를 입력해 주세요.");
        return;
        }

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
        setIsModalOpen(false);
        setForm(initialForm);
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
            <h1 className="text-2xl font-bold">나의 <span className="text-blue-600">냉장고</span></h1>
            <button className="text-xs text-gray-500">유통기한 빠른순</button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap border ${
                    active
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                >
                    {category}
                </button>
                );
            })}
            </div>

            {filteredItems.length === 0 ? (
            <div className="h-[60vh] flex items-center justify-center text-gray-400 text-sm">
                냉장고에 재료가 없습니다
            </div>
            ) : (
            <div className="space-y-3 pb-28">
                {filteredItems.map((item) => (
                <FridgeItemCard
                    key={item.id}
                    item={item}
                    onToggleFavorite={toggleFavorite}
                />
                ))}
            </div>
            )}

            <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 ml-[140px] w-14 h-14 rounded-full bg-gray-200 text-3xl text-gray-700 shadow-sm"
            aria-label="재료 추가"
            >
            +
            </button>

            <AddIngredient
            isOpen={isModalOpen}
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