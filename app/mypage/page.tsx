"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Toast from "@/components/Toast";
import { fetchUserProfile, UserProfile } from "@/lib/dashboardApi";
import { updateUserPreferences } from "@/lib/mypageApi";
import { removeToken } from "@/utils/auth";
import { useToast } from "@/hooks/useToast";
import { User, Bell, ChevronRight, LogOut, Trash2, X } from "lucide-react";

// ── 전역 keyframe 주입 ────────────────────────────────────────────
const STYLES = `
  @keyframes sheet-up {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes backdrop-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes tag-pop {
    0%   { opacity: 0; transform: scale(0.7) translateY(6px); }
    60%  { transform: scale(1.08) translateY(-1px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes profile-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bell-ring {
    0%,100% { transform: rotate(0deg); }
    20%     { transform: rotate(-22deg); }
    40%     { transform: rotate(22deg); }
    60%     { transform: rotate(-12deg); }
    80%     { transform: rotate(12deg); }
  }
  @keyframes save-press {
    0%   { transform: scale(1); }
    40%  { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  .anim-sheet-up   { animation: sheet-up 0.4s cubic-bezier(0.32,0.72,0,1) both; }
  .anim-backdrop   { animation: backdrop-fade 0.3s ease both; }
  .anim-profile-in { animation: profile-in 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-bell-ring  { animation: bell-ring 0.5s ease both; }
  .anim-save-press { animation: save-press 0.2s ease both; }
`;

// ── 선택지 ────────────────────────────────────────────────────────

const ALLERGY_OPTIONS = [
  "견과류", "갑각류", "달걀", "우유", "밀/글루텐",
  "대두", "복숭아", "땅콩", "생선", "조개류", "메밀", "돼지고기",
];

const TASTE_OPTIONS = ["맵게", "달콤하게", "짭짤하게", "담백하게", "고소하게", "신맛"];

const CATEGORY_OPTIONS = ["한식", "양식", "중식", "일식", "분식", "채식", "퓨전", "디저트"];

// ── 토글 스위치 (스프링 엄지 + 벨 흔들기) ────────────────────────

function Toggle({
  on,
  onChange,
  bellRef,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  bellRef?: React.RefObject<HTMLDivElement | null>;
}) {
  function handleClick() {
    onChange(!on);
    if (bellRef?.current) {
      bellRef.current.classList.remove("anim-bell-ring");
      // reflow trick — force re-trigger
      void bellRef.current.offsetWidth;
      bellRef.current.classList.add("anim-bell-ring");
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300
        ${on ? "bg-green-600" : "bg-gray-200"}`}
      aria-checked={on}
      role="switch"
    >
      {/* 스프링 오버슈트 이징 */}
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
          transition-transform duration-[350ms]
          [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]
          ${on ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// ── 선택 모달 (바텀시트) ──────────────────────────────────────────

type SelectModalProps = {
  title: string;
  options: string[];
  selected: string[];
  onClose: () => void;
  onSave: (selected: string[]) => void;
};

function SelectModal({ title, options, selected, onClose, onSave }: SelectModalProps) {
  const [draft, setDraft] = useState<string[]>(selected);
  const [lastToggled, setLastToggled] = useState<string | null>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  function toggle(item: string) {
    setLastToggled(item);
    setDraft((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  function handleSave() {
    if (saveRef.current) {
      saveRef.current.classList.remove("anim-save-press");
      void saveRef.current.offsetWidth;
      saveRef.current.classList.add("anim-save-press");
    }
    setTimeout(() => onSave(draft), 120);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="fixed inset-0 bg-black/40 z-[100] flex items-end justify-center anim-backdrop"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-[430px] rounded-t-3xl flex flex-col max-h-[85vh] anim-sheet-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 드래그 핸들 */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 pt-3 pb-4 shrink-0">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500
                hover:bg-gray-200 active:scale-90 transition-all duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 선택지 — 스크롤 */}
          <div className="flex-1 overflow-y-auto px-6 pb-2">
            <div className="flex flex-wrap gap-2 pb-2">
              {options.map((opt) => {
                const isOn = draft.includes(opt);
                const justToggled = lastToggled === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => toggle(opt)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border
                      transition-all duration-200 active:scale-90
                      ${isOn
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-300"
                      }
                      ${justToggled ? "scale-105" : "scale-100"}
                    `}
                    style={justToggled ? { animation: "tag-pop 0.35s cubic-bezier(0.34,1.56,0.64,1)" } : undefined}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="px-6 pt-3 pb-10 shrink-0">
            <button
              ref={saveRef}
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-green-600 text-white text-sm font-bold
                active:bg-green-700 transition-colors duration-150"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── 카드 버튼 래퍼 (눌림 효과) ───────────────────────────────────

function PressCard({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-transform duration-150 active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────

export default function MyPage() {
  const router = useRouter();
  const { toastMessage, toastVisible, showToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [tastes, setTastes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [dangerAlarm, setDangerAlarm] = useState(true);
  const [recipeAlarm, setRecipeAlarm] = useState(false);

  const dangerBellRef = useRef<HTMLDivElement>(null);
  const recipeBellRef = useRef<HTMLDivElement>(null);

  type ModalType = "allergy" | "taste" | "category" | null;
  const [openModal, setOpenModal] = useState<ModalType>(null);

  useEffect(() => {
    fetchUserProfile()
      .then((p) => {
        setProfile(p);
        setAllergies(p.allergies ?? []);
        setTastes(p.tastes ?? []);
        setCategories(p.categories ?? []);
        setTimeout(() => setProfileVisible(true), 50);
      })
      .catch(() => showToast("프로필 불러오기에 실패했어요"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveAllergy(next: string[]) {
    setAllergies(next);
    setOpenModal(null);
    try {
      await updateUserPreferences({ allergies: next, tastes, categories });
      showToast("알레르기 설정이 저장됐어요");
    } catch {
      showToast("저장에 실패했어요");
    }
  }

  async function handleSaveTaste(next: string[]) {
    setTastes(next);
    setOpenModal(null);
    try {
      await updateUserPreferences({ allergies, tastes: next, categories });
      showToast("취향 설정이 저장됐어요");
    } catch {
      showToast("저장에 실패했어요");
    }
  }

  async function handleSaveCategory(next: string[]) {
    setCategories(next);
    setOpenModal(null);
    try {
      await updateUserPreferences({ allergies, tastes, categories: next });
      showToast("카테고리 설정이 저장됐어요");
    } catch {
      showToast("저장에 실패했어요");
    }
  }

  function handleLogout() {
    if (!window.confirm("로그아웃 할까요?")) return;
    removeToken();
    router.push("/login");
  }

  function handleWithdraw() {
    if (!window.confirm("정말 탈퇴하시겠어요?\n이 작업은 되돌릴 수 없습니다.")) return;
    showToast("회원 탈퇴 기능은 준비 중이에요");
  }

  const firstName = profile?.name ?? "";

  return (
    <>
      <style>{STYLES}</style>
      <div className="flex min-h-screen justify-center bg-gray-50">
        <div className="w-full max-w-sm bg-gray-50 min-h-screen pb-28">

          {/* 헤더 */}
          <div className="bg-white px-5 pt-10 pb-5 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <h1 className="text-xl font-extrabold text-gray-950 mb-4">마이페이지</h1>

            {/* 프로필 — 페이드업 등장 */}
            {loading ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-3 w-36 rounded bg-gray-100" />
                </div>
              </div>
            ) : (
              <div className={`flex items-center gap-4 ${profileVisible ? "anim-profile-in" : "opacity-0"}`}>
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center ring-2 ring-green-200">
                  <User className="w-7 h-7 text-green-700" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{profile?.name ?? "이름 없음"}</p>
                  <p className="text-[13px] text-gray-400 mt-0.5">{profile?.email ?? ""}</p>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 pt-5 space-y-4">

            {/* ── 알레르기 ── */}
            <section>
              <h2 className="text-[13px] font-semibold text-gray-500 mb-2 px-1">알레르기</h2>
              <PressCard onClick={() => setOpenModal("allergy")}>
                {allergies.length === 0 ? (
                  <div className="w-full rounded-2xl bg-amber-400 px-5 py-5 flex flex-col items-center gap-1
                    shadow-[0_4px_14px_rgba(251,191,36,0.4)]">
                    <p className="text-base font-bold text-white">알레르기를 알려주세요</p>
                    <p className="text-[12px] text-white/80">추가하려면 클릭</p>
                  </div>
                ) : (
                  <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-semibold text-gray-700">설정된 알레르기</span>
                      <span className="text-[11px] text-gray-400">탭하여 수정</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allergies.map((a, i) => (
                        <span
                          key={a}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"
                          style={{ animation: `tag-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms both` }}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </PressCard>
            </section>

            {/* ── 취향설정 ── */}
            <section>
              <h2 className="text-[13px] font-semibold text-gray-500 mb-2 px-1">취향설정</h2>
              <div className="space-y-2">

                <PressCard onClick={() => setOpenModal("taste")}>
                  {tastes.length === 0 ? (
                    <div className="w-full rounded-2xl bg-green-800 px-5 py-5 flex flex-col items-center gap-1
                      shadow-[0_4px_14px_rgba(22,101,52,0.35)]">
                      <p className="text-base font-bold text-white">{firstName}님의 입맛이 궁금해요</p>
                      <p className="text-[12px] text-white/70">추가하려면 클릭</p>
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] font-semibold text-gray-700">맛 취향</span>
                        <span className="text-[11px] text-gray-400">탭하여 수정</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tastes.map((t, i) => (
                          <span
                            key={t}
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200"
                            style={{ animation: `tag-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms both` }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </PressCard>

                <PressCard onClick={() => setOpenModal("category")}>
                  {categories.length === 0 ? (
                    <div className="w-full rounded-2xl bg-green-700 px-5 py-5 flex flex-col items-center gap-1
                      shadow-[0_4px_14px_rgba(21,128,61,0.3)]">
                      <p className="text-base font-bold text-white">선호하는 음식 종류는요?</p>
                      <p className="text-[12px] text-white/70">추가하려면 클릭</p>
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] font-semibold text-gray-700">선호 카테고리</span>
                        <span className="text-[11px] text-gray-400">탭하여 수정</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((c, i) => (
                          <span
                            key={c}
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                            style={{ animation: `tag-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms both` }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </PressCard>
              </div>
            </section>

            {/* ── 알림설정 ── */}
            <section>
              <h2 className="text-[13px] font-semibold text-gray-500 mb-2 px-1">알림설정</h2>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">

                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      ref={dangerBellRef}
                      className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"
                    >
                      <Bell className="w-4 h-4 text-red-500" strokeWidth={2} />
                    </div>
                    <span className="text-[14px] font-medium text-gray-800">폐기 위험 재료 알림</span>
                  </div>
                  <Toggle on={dangerAlarm} onChange={setDangerAlarm} bellRef={dangerBellRef} />
                </div>

                <div className="h-px bg-gray-100 mx-4" />

                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      ref={recipeBellRef}
                      className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"
                    >
                      <Bell className="w-4 h-4 text-green-600" strokeWidth={2} />
                    </div>
                    <span className="text-[14px] font-medium text-gray-800">레시피 추천 알림</span>
                  </div>
                  <Toggle on={recipeAlarm} onChange={setRecipeAlarm} bellRef={recipeBellRef} />
                </div>
              </div>
            </section>

            {/* ── 계정설정 ── */}
            <section>
              <h2 className="text-[13px] font-semibold text-gray-500 mb-2 px-1">계정설정</h2>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">

                <div className="flex items-center justify-between px-4 py-4">
                  <span className="text-[14px] font-medium text-gray-800">소셜 계정 연동</span>
                  <span className="text-[13px] text-gray-400 truncate max-w-[160px]">
                    {profile?.email ?? "—"}
                  </span>
                </div>

                <div className="h-px bg-gray-100 mx-4" />

                <button
                  onClick={handleLogout}
                  className="group w-full flex items-center justify-between px-4 py-4
                    transition-colors duration-150 active:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-gray-400 transition-transform duration-200 group-active:-translate-x-1" strokeWidth={2} />
                    <span className="text-[14px] font-medium text-gray-800">로그아웃</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 transition-transform duration-200 group-active:translate-x-1" />
                </button>

                <div className="h-px bg-gray-100 mx-4" />

                <button
                  onClick={handleWithdraw}
                  className="group w-full flex items-center justify-between px-4 py-4
                    transition-colors duration-150 active:bg-red-50"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-400 transition-transform duration-200 group-active:scale-110" strokeWidth={2} />
                    <span className="text-[14px] font-medium text-red-500">회원 탈퇴</span>
                  </div>
                  <span className="text-[13px] text-gray-400 transition-opacity duration-150 group-active:opacity-60">
                    탈퇴하기
                  </span>
                </button>
              </div>
            </section>

          </div>

          {/* 모달 */}
          {openModal === "allergy" && (
            <SelectModal
              title="알레르기 설정"
              options={ALLERGY_OPTIONS}
              selected={allergies}
              onClose={() => setOpenModal(null)}
              onSave={handleSaveAllergy}
            />
          )}
          {openModal === "taste" && (
            <SelectModal
              title="맛 취향 설정"
              options={TASTE_OPTIONS}
              selected={tastes}
              onClose={() => setOpenModal(null)}
              onSave={handleSaveTaste}
            />
          )}
          {openModal === "category" && (
            <SelectModal
              title="선호 카테고리 설정"
              options={CATEGORY_OPTIONS}
              selected={categories}
              onClose={() => setOpenModal(null)}
              onSave={handleSaveCategory}
            />
          )}

          <Toast message={toastMessage} visible={toastVisible} />
          <BottomNav />
        </div>
      </div>
    </>
  );
}
