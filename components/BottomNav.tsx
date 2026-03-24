import Link from "next/link"
export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-sm -translate-x-1/2 bg-white px-4 py-2 h-20">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex flex-col items-center text-black">
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-semibold">홈</span>
        </Link>

        <Link href="/fridge" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">❄️</span>
          <span className="text-xs">냉장고</span>
        </Link>

        <div className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">🛒</span>
          <span className="text-xs">장바구니</span>
        </div>

        <div className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">👨‍🍳</span>
          <span className="text-xs">레시피</span>
        </div>

        <div className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">👤</span>
          <span className="text-xs">MY</span>
        </div>
      </div>
    </nav>
  );
}