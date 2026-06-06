"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Timer, CheckCircle, Play, Pause } from "lucide-react";
import { RecipeStep } from "@/types/recipe";

function extractMinutes(text: string): number | null {
  const match = text.match(/(\d+)\s*분/);
  return match ? parseInt(match[1], 10) : null;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TimerRing({
  total,
  left,
  running,
}: {
  total: number;
  left: number;
  running: boolean;
}) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? left / total : 0;

  return (
    <div className={`relative ${running && left > 0 ? "animate-ringPulse" : ""}`}>
      <svg width={104} height={104} viewBox="0 0 104 104" className="-rotate-90">
        <circle
          cx={52} cy={52} r={r}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={9}
        />
        <circle
          cx={52} cy={52} r={r}
          fill="none"
          stroke={left === 0 ? "#4ade80" : "#22c55e"}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {left === 0 ? (
          <span className="text-green-400 text-lg font-bold">완료!</span>
        ) : (
          <span className="text-white text-xl font-mono font-bold tabular-nums">
            {formatTime(left)}
          </span>
        )}
      </div>
    </div>
  );
}

interface Props {
  steps: RecipeStep[];
  title: string;
  onClose: () => void;
}

export default function CookingMode({ steps, title, onClose }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [dir, setDir] = useState<"fwd" | "bwd">("fwd");
  const [animKey, setAnimKey] = useState(0);

  const [timerTotal, setTimerTotal] = useState<number | null>(null);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentIdx];
  const detectedMins = currentStep ? extractMinutes(currentStep.content) : null;
  const progressPct = (currentIdx / steps.length) * 100;

  // 화면 꺼짐 방지
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    (
      navigator as Navigator & {
        wakeLock: { request: (t: string) => Promise<WakeLockSentinel> };
      }
    )
      .wakeLock.request("screen")
      .then((l) => {
        lock = l;
      })
      .catch(() => {});
    return () => {
      lock?.release();
    };
  }, []);

  // 타이머
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(intervalRef.current!);
            setTimerRunning(false);
            if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  // 단계 이동 시 타이머 리셋
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerRunning(false);
    setTimerLeft(null);
    setTimerTotal(null);
  }, [currentIdx]);

  function startTimer(mins: number) {
    const secs = mins * 60;
    setTimerTotal(secs);
    setTimerLeft(secs);
    setTimerRunning(true);
  }

  function goNext() {
    if (currentIdx < steps.length - 1) {
      setDir("fwd");
      setAnimKey((k) => k + 1);
      setCurrentIdx((i) => i + 1);
    } else {
      setDone(true);
    }
  }

  function goPrev() {
    if (currentIdx > 0) {
      setDir("bwd");
      setAnimKey((k) => k + 1);
      setCurrentIdx((i) => i - 1);
    }
  }

  // ── 완료 화면 ──
  if (done) {
    return (
      <div
        className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-50
          bg-gradient-to-b from-green-700 via-emerald-800 to-green-900
          flex flex-col items-center justify-center px-8 text-center
          animate-slideInUp"
      >
        {/* 배경 장식 원 */}
        <div className="absolute top-16 right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute bottom-24 left-6 w-20 h-20 rounded-full bg-white/5" />

        <div className="animate-cookingDone flex flex-col items-center gap-4">
          <div className="text-8xl animate-bounce">🍽️</div>
          <div>
            <h2 className="text-3xl font-extrabold text-white">요리 완료!</h2>
            <p className="text-green-200 text-base mt-1">수고하셨어요 😊</p>
          </div>
          <div className="flex gap-3 mt-6">
            {Array.from({ length: steps.length }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-14 px-10 py-4 bg-white text-green-700 text-sm font-bold rounded-2xl
            shadow-2xl shadow-green-900/40 active:scale-95 transition-transform"
        >
          레시피로 돌아가기
        </button>
      </div>
    );
  }

  // ── 요리 모드 ──
  return (
    <div
      className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-50
        bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col overflow-hidden
        animate-slideInUp"
    >
      {/* 배경 장식 */}
      <div className="absolute top-20 -right-10 w-40 h-40 rounded-full bg-green-600/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-32 -left-10 w-36 h-36 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none" />

      {/* 진행 바 */}
      <div className="relative w-full h-1.5 bg-white/10">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-400
            rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div>
          <p className="text-[11px] text-white/40 font-medium truncate max-w-[200px]">
            {title}
          </p>
          <p className="text-sm font-bold mt-0.5">
            <span className="text-green-400">{currentIdx + 1}</span>
            <span className="text-white/30"> / {steps.length}단계</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center
            active:bg-white/20 transition-colors"
          aria-label="닫기"
        >
          <X size={16} className="text-white/70" />
        </button>
      </div>

      {/* 점 인디케이터 */}
      <div className="flex justify-center gap-1.5 py-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === currentIdx
                ? "w-5 h-2 bg-green-400"
                : i < currentIdx
                ? "w-2 h-2 bg-green-700"
                : "w-2 h-2 bg-white/15"
            }`}
          />
        ))}
      </div>

      {/* 메인 콘텐츠 — 단계 이동 시 슬라이드 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4 overflow-hidden">
        <div
          key={animKey}
          className={`w-full flex flex-col items-center gap-5 ${
            dir === "fwd" ? "animate-slideInRight" : "animate-slideInLeft"
          }`}
        >
          {/* 단계 번호 배지 */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center
                bg-gradient-to-br from-green-500 to-emerald-600
                shadow-lg shadow-green-900/50 animate-popIn"
            >
              <span className="text-3xl font-extrabold text-white">
                {currentStep.stepOrder}
              </span>
            </div>
            {/* 빛나는 링 */}
            <div className="absolute -inset-2 rounded-full border border-green-500/20 animate-ping"
              style={{ animationDuration: "2.5s" }}
            />
          </div>

          {/* 단계 내용 카드 */}
          <div
            className="w-full border border-white/10 rounded-3xl px-6 py-5
              bg-white/5 backdrop-blur-sm"
          >
            <p className="text-white text-lg font-semibold text-center leading-relaxed">
              {currentStep.content}
            </p>
          </div>

          {/* 타이머 — 미시작 상태 */}
          {detectedMins && timerLeft === null && (
            <button
              onClick={() => startTimer(detectedMins)}
              className="flex items-center gap-2 px-5 py-3 rounded-full
                bg-white/10 border border-white/15 text-white/80 text-sm font-semibold
                active:bg-white/20 transition-colors"
            >
              <Timer size={16} className="text-green-400" />
              {detectedMins}분 타이머 시작
            </button>
          )}

          {/* 타이머 — 진행 중 */}
          {timerLeft !== null && timerTotal !== null && (
            <div className="flex flex-col items-center gap-3">
              <TimerRing
                total={timerTotal}
                left={timerLeft}
                running={timerRunning}
              />
              {timerLeft > 0 && (
                <button
                  onClick={() => setTimerRunning((r) => !r)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full
                    bg-white/10 text-white/60 text-xs font-bold active:bg-white/20 transition-colors"
                >
                  {timerRunning ? (
                    <><Pause size={12} /> 일시정지</>
                  ) : (
                    <><Play size={12} /> 계속</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 하단 네비 */}
      <div className="px-5 pb-12 pt-3 flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center
            disabled:opacity-20 active:bg-white/20 transition-all"
          aria-label="이전 단계"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>

        <button
          onClick={goNext}
          className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2
            font-bold text-white text-sm transition-all active:scale-95
            bg-gradient-to-r from-green-600 to-emerald-500
            shadow-lg shadow-green-900/40"
        >
          {currentIdx === steps.length - 1 ? (
            <>
              <CheckCircle size={18} />
              요리 완료
            </>
          ) : (
            <>
              다음 단계
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
