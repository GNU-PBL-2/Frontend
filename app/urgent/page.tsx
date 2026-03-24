import BottomNav from "@/components/BottomNav";

export default function UrgentPage() {
  const urgentItems = [
    { name: "두부", count: 1, dday: "D-1", icon: "🥬" },
    { name: "시금치", count: 1, dday: "D-1", icon: "🥬" },
    { name: "계란", count: 1, dday: "D-3", icon: "🥬" },
  ];

  const getDdayColor = (dday: string) => {
    if (dday === "D-1") return "text-red-500";
    if (dday === "D-3") return "text-orange-400";
    return "text-gray-500";
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen p-4">
        <div className="mt-6 mb-6">
          <h1 className="text-2xl font-bold ml-1">
            유통기한 <span className="text-red-500">임박 재료</span>
          </h1>
        </div>

        <div className="space-y-4">
          {urgentItems.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4"
            >
              <div className="w-24 h-24 rounded-md bg-gray-100 flex items-center justify-center text-4xl">
                {item.icon}
              </div>

              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">
                  {item.name} {item.count}
                </p>
                <p className={`mt-1 text-2xl font-bold ${getDdayColor(item.dday)}`}>
                  {item.dday}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 bg-green-600 text-white font-bold text-xl rounded-xl py-4 shadow-sm">
          활용 가능한 레시피 확인하기
        </button>

        <div className="h-24" />
      </div>

      <BottomNav />
    </div>
  );
}