"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ImagePlus, RotateCcw, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { detectIngredients, MatchedIngredient } from "@/lib/scanApi";
import { createFridgeItem, fetchMasterIngredients, MasterIngredient } from "@/lib/fridgeApi";
import { getUserIdFromToken } from "@/utils/auth";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";

type Step = "camera" | "preview" | "analyzing" | "results";

interface ResultItem extends MatchedIngredient {
  selected: boolean;
  expiryDate: string;
}

interface UnmatchedForm {
  detectedName: string;
  query: string;
  selectedIngredient: MasterIngredient | null;
  expiryDate: string;
  selected: boolean;
}

function defaultExpiry(days = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>("camera");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [matched, setMatched] = useState<ResultItem[]>([]);
  const [unmatchedForms, setUnmatchedForms] = useState<UnmatchedForm[]>([]);
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);
  const [cameraError, setCameraError] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toastMessage, toastVisible, showToast } = useToast();

  /* ── 카메라 시작 ── */
  useEffect(() => {
    if (step !== "camera") return;

    let active = true;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError(true));

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [step]);

  /* ── 결과 화면 진입 시 마스터 재료 로드 ── */
  useEffect(() => {
    if (step !== "results") return;
    fetchMasterIngredients().then(setMasterIngredients).catch(() => {});
  }, [step]);

  /* ── 640×640 중앙 크롭 (백엔드 전송용) ── */
  function cropCenterTo640(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const size = Math.min(img.naturalWidth, img.naturalHeight);
        const sx   = (img.naturalWidth  - size) / 2;
        const sy   = (img.naturalHeight - size) / 2;
        const canvas = document.createElement("canvas");
        canvas.width  = 640;
        canvas.height = 640;
        canvas.getContext("2d")?.drawImage(img, sx, sy, size, size, 0, 0, 640, 640);
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("crop failed")); return; }
          resolve(new File([blob], "image.jpg", { type: "image/jpeg" }));
        }, "image/jpeg", 0.85);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  /* ── 카메라 촬영: 원본 전체 캡처 → 프리뷰 표시 ── */
  function handleCapture() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setCapture(file);
    }, "image/jpeg", 0.92);
  }

  /* ── 갤러리 선택: 원본 그대로 → 프리뷰 표시 ── */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setCapture(file);
  }

  function setCapture(file: File) {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    const url = URL.createObjectURL(file);
    setCapturedFile(file);
    setCapturedUrl(url);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStep("preview");
  }

  /* ── 다시 찍기 ── */
  function handleRetake() {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedFile(null);
    setCapturedUrl(null);
    setCameraError(false);
    setMatched([]);
    setUnmatchedForms([]);
    setStep("camera");
  }

  /* ── YOLO 분석 ── */
  async function handleAnalyze() {
    if (!capturedFile) return;
    setStep("analyzing");
    try {
      const fileToSend = await cropCenterTo640(capturedFile).catch(() => capturedFile);
      const res = await detectIngredients(fileToSend);

      if (res.matched.length === 0 && res.unmatched.length === 0) {
        showToast("재료를 인식하지 못했어요. 다시 시도해주세요.");
        setStep("preview");
        return;
      }

      setMatched(res.matched.map((item) => ({
        ...item,
        selected: true,
        expiryDate: defaultExpiry(),
      })));
      setUnmatchedForms(res.unmatched.map((name) => ({
        detectedName: name,
        query: name,
        selectedIngredient: null,
        expiryDate: defaultExpiry(),
        selected: false,
      })));
      setStep("results");
    } catch {
      showToast("분석에 실패했어요. 다시 시도해주세요.");
      setStep("preview");
    }
  }

  /* ── matched 토글 / 날짜 수정 ── */
  function toggleSelect(id: number) {
    setMatched((prev) =>
      prev.map((item) =>
        item.ingredientId === id ? { ...item, selected: !item.selected } : item
      )
    );
  }

  function updateExpiry(id: number, date: string) {
    setMatched((prev) =>
      prev.map((item) =>
        item.ingredientId === id ? { ...item, expiryDate: date } : item
      )
    );
  }

  /* ── unmatched 폼 업데이트 ── */
  function updateUnmatched(idx: number, patch: Partial<UnmatchedForm>) {
    setUnmatchedForms((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, ...patch } : f))
    );
  }

  function getSearchResults(query: string): MasterIngredient[] {
    if (!query.trim()) return [];
    return masterIngredients.filter((i) => i.name.includes(query)).slice(0, 6);
  }

  /* ── 냉장고에 추가 ── */
  async function handleSave() {
    const memberId = getUserIdFromToken();
    if (!memberId) { showToast("로그인이 필요합니다"); return; }

    const matchedToAdd = matched.filter((item) => item.selected && item.expiryDate);
    const unmatchedToAdd = unmatchedForms.filter(
      (f) => f.selected && f.selectedIngredient && f.expiryDate
    );

    if (matchedToAdd.length === 0 && unmatchedToAdd.length === 0) {
      showToast("추가할 재료를 선택해주세요");
      return;
    }

    setSaving(true);
    const settled = await Promise.allSettled([
      ...matchedToAdd.map((item) =>
        createFridgeItem({
          memberId: memberId!,
          ingredientId: item.ingredientId,
          quantity: 1,
          unit: "개",
          expiryDate: item.expiryDate,
        })
      ),
      ...unmatchedToAdd.map((f) =>
        createFridgeItem({
          memberId: memberId!,
          ingredientId: f.selectedIngredient!.ingredientId,
          quantity: 1,
          unit: "개",
          expiryDate: f.expiryDate,
        })
      ),
    ]);
    setSaving(false);

    const ok   = settled.filter((r) => r.status === "fulfilled").length;
    const fail = settled.filter((r) => r.status === "rejected").length;

    if (ok > 0) {
      showToast(`${ok}개 재료를 냉장고에 추가했어요 🎉`);
      setTimeout(() => router.push("/fridge"), 1300);
    } else {
      showToast("추가에 실패했어요. 다시 시도해주세요.");
    }
    if (fail > 0 && ok > 0) showToast(`${fail}개는 추가에 실패했어요`);
  }

  const selectedCount =
    matched.filter((r) => r.selected).length +
    unmatchedForms.filter((f) => f.selected && f.selectedIngredient).length;

  /* ──────────────────────────────────────────────────── */
  return (
    <div className="bg-black min-h-screen flex justify-center">
      <div className="w-full max-w-sm relative min-h-screen flex flex-col">

        {/* ── 상단 헤더 ── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center px-4 pt-12 pb-4
          bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <button
            onClick={() => (step === "results" ? handleRetake() : router.back())}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-black/30 text-white pointer-events-auto"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-3 text-white text-[17px] font-bold">재료 인식</h1>

          {step === "preview" && (
            <button
              onClick={handleAnalyze}
              className="ml-auto px-4 py-1.5 rounded-full bg-green-500 text-white text-[13px] font-bold pointer-events-auto"
            >
              분석하기
            </button>
          )}
        </div>

        {/* ══ STEP: camera ══ */}
        {step === "camera" && (
          <>
            {cameraError ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gray-800 flex items-center justify-center">
                  <ImagePlus className="w-10 h-10 text-gray-500" />
                </div>
                <div>
                  <p className="text-white text-[16px] font-bold">카메라를 사용할 수 없어요</p>
                  <p className="text-gray-400 text-[13px] mt-2 leading-5">
                    카메라 권한을 허용하거나<br />갤러리에서 사진을 선택해주세요
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-gray-900 text-[14px] font-bold"
                >
                  <ImagePlus className="w-5 h-5" />
                  갤러리에서 선택
                </button>
              </div>
            ) : (
              <div className="flex-1 relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 rounded-3xl border-2 border-white/50
                    shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                </div>
                <p className="absolute top-1/2 mt-40 left-0 right-0 text-center text-white/70 text-[12px]">
                  재료가 화면에 들어오도록 맞춰주세요
                </p>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 pb-10 pt-6
              bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center gap-12">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <ImagePlus className="w-6 h-6 text-white" />
                </div>
                <span className="text-white/70 text-[11px]">갤러리</span>
              </button>

              {!cameraError && (
                <button
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center
                    shadow-[0_0_0_4px_rgba(255,255,255,0.4)] active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-200" />
                </button>
              )}
            </div>
          </>
        )}

        {/* ══ STEP: preview / analyzing ══ */}
        {(step === "preview" || step === "analyzing") && capturedUrl && (
          <div className="flex-1 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedUrl}
              alt="캡처된 이미지"
              className={`absolute inset-0 w-full h-full object-cover transition-all ${
                step === "analyzing" ? "brightness-50" : ""
              }`}
            />

            {step === "analyzing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                <p className="text-white text-[15px] font-bold">YOLO가 재료를 분석하고 있어요...</p>
                <p className="text-white/60 text-[12px]">잠시만 기다려주세요</p>
              </div>
            )}

            {step === "preview" && (
              <div className="absolute bottom-0 left-0 right-0 pb-12 flex justify-center">
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/50 backdrop-blur text-white text-[13px] font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  다시 찍기
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP: results ══ */}
        {step === "results" && (
          <div className="flex-1 flex flex-col bg-[#F4F7EF] pt-28 pb-36 overflow-y-auto">
            <div className="px-4">
              <p className="text-[20px] font-extrabold text-gray-900">
                {matched.length + unmatchedForms.length}개 재료가 감지됐어요
              </p>
              <p className="text-[13px] text-gray-400 mt-1">
                추가할 재료를 선택하고 유통기한을 설정해주세요
              </p>
            </div>

            {/* ── 매칭된 재료 ── */}
            {matched.length > 0 && (
              <div className="mt-5 px-4 space-y-3">
                {matched.map((item) => (
                  <div
                    key={item.ingredientId}
                    className={`bg-white rounded-2xl border-2 px-4 py-3.5 transition-colors ${
                      item.selected ? "border-green-400" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleSelect(item.ingredientId)} className="shrink-0">
                        {item.selected
                          ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                          : <Circle className="w-6 h-6 text-gray-300" />}
                      </button>
                      <span className={`text-[15px] font-bold flex-1 ${
                        item.selected ? "text-gray-900" : "text-gray-400"
                      }`}>
                        {item.ingredientName}
                      </span>
                    </div>

                    {item.selected && (
                      <div className="mt-3 flex items-center gap-2 pl-9">
                        <span className="text-[12px] text-gray-400 shrink-0">유통기한</span>
                        <input
                          type="date"
                          value={item.expiryDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => updateExpiry(item.ingredientId, e.target.value)}
                          className="flex-1 text-[13px] text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5
                            focus:outline-none focus:border-green-400 bg-gray-50"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── 미매칭 재료: 직접 입력 ── */}
            {unmatchedForms.length > 0 && (
              <div className="mt-5 px-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <p className="text-[12px] font-semibold text-amber-600">
                    DB에 없는 재료 — 직접 선택해주세요 ({unmatchedForms.length}개)
                  </p>
                </div>

                {unmatchedForms.map((form, idx) => {
                  const results = getSearchResults(form.query);
                  const showDropdown = form.query.trim().length > 0 && !form.selectedIngredient;

                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-2xl border-2 px-4 py-3.5 transition-colors ${
                        form.selected && form.selectedIngredient
                          ? "border-green-400"
                          : "border-amber-200"
                      }`}
                    >
                      {/* 감지된 이름 힌트 */}
                      <p className="text-[11px] text-amber-500 font-medium mb-2">
                        감지: {form.detectedName}
                      </p>

                      {/* 검색 입력 */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="재료 이름 검색..."
                          value={form.query}
                          onChange={(e) =>
                            updateUnmatched(idx, {
                              query: e.target.value,
                              selectedIngredient: null,
                              selected: false,
                            })
                          }
                          className="w-full text-[13px] text-gray-700 border border-gray-200 rounded-xl px-3 py-2
                            focus:outline-none focus:border-green-400 bg-gray-50"
                        />

                        {/* 드롭다운 */}
                        {showDropdown && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200
                            rounded-xl shadow-lg overflow-hidden">
                            {results.length > 0 ? (
                              results.map((ing) => (
                                <button
                                  key={ing.ingredientId}
                                  onClick={() =>
                                    updateUnmatched(idx, {
                                      selectedIngredient: ing,
                                      query: ing.name,
                                      selected: true,
                                    })
                                  }
                                  className="w-full text-left px-3 py-2.5 text-[13px] text-gray-700
                                    hover:bg-green-50 active:bg-green-100 border-b border-gray-50 last:border-0"
                                >
                                  {ing.name}
                                </button>
                              ))
                            ) : (
                              <p className="px-3 py-2.5 text-[12px] text-gray-400">
                                검색 결과가 없어요
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 선택 완료 후: 체크박스 + 유통기한 */}
                      {form.selectedIngredient && (
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            onClick={() => updateUnmatched(idx, { selected: !form.selected })}
                            className="shrink-0"
                          >
                            {form.selected
                              ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                              : <Circle className="w-6 h-6 text-gray-300" />}
                          </button>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-[12px] text-gray-400 shrink-0">유통기한</span>
                            <input
                              type="date"
                              value={form.expiryDate}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) =>
                                updateUnmatched(idx, { expiryDate: e.target.value })
                              }
                              className="flex-1 text-[13px] text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5
                                focus:outline-none focus:border-green-400 bg-gray-50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ Results 하단 FAB ══ */}
        {step === "results" && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pb-8 z-30">
            <button
              onClick={handleSave}
              disabled={saving || selectedCount === 0}
              className={`w-full py-4 rounded-2xl text-[15px] font-bold transition-all
                shadow-[0_8px_24px_rgba(22,163,74,0.35)]
                ${selectedCount > 0
                  ? "bg-green-600 text-white active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400"
                }
                disabled:opacity-60`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  추가하는 중...
                </span>
              ) : selectedCount > 0 ? (
                `냉장고에 ${selectedCount}개 추가하기`
              ) : (
                "재료를 선택해주세요"
              )}
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <Toast message={toastMessage} visible={toastVisible} />
      </div>
    </div>
  );
}
