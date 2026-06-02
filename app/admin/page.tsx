"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importRecipeFromYoutube } from "@/lib/adminApi";

type Status = "idle" | "loading" | "success" | "error";

interface ImportRecord {
  uid: string;
  url: string;
  recipeId: number;
  timestamp: string;
}

function isValidYoutubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/.test(url.trim());
}

export default function AdminPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<ImportRecord[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!url.trim()) {
      setErrorMsg("YouTube URL을 입력해주세요");
      setStatus("error");
      return;
    }
    if (!isValidYoutubeUrl(url)) {
      setErrorMsg("올바른 YouTube URL 형식이 아닙니다");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    setCreatedId(null);

    try {
      const recipeId = await importRecipeFromYoutube(url.trim());
      setCreatedId(recipeId);
      setStatus("success");
      setHistory((prev) =>
        [
          {
            uid: Date.now().toString(),
            url: url.trim(),
            recipeId,
            timestamp: new Date().toLocaleString("ko-KR"),
          },
          ...prev,
        ].slice(0, 20)
      );
      setUrl("");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요"
      );
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 leading-5">
          YouTube URL을 입력하면 Gemini가 영상을 분석해 레시피를 자동으로 생성합니다
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            YouTube URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (status !== "loading") setStatus("idle");
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={status === "loading"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900
              placeholder:text-gray-400 focus:outline-none focus:border-green-500
              disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            youtube.com/watch, youtu.be, youtube.com/shorts 형식 지원
          </p>
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !url.trim()}
          className="w-full py-3.5 rounded-xl bg-green-700 text-white text-sm font-bold
            disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600
            active:bg-green-800 transition-colors"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2.5">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gemini가 분석 중... (최대 1분 소요)
            </span>
          ) : (
            "레시피 등록하기"
          )}
        </button>
      </form>

      {status === "loading" && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-sm font-semibold text-blue-700">분석 중입니다</p>
          <p className="text-xs text-blue-500 mt-1 leading-5">
            Gemini가 영상 자막과 정보를 분석하고 있어요.
            <br />
            페이지를 닫지 말고 기다려주세요.
          </p>
        </div>
      )}

      {status === "success" && createdId !== null && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-sm font-bold text-green-700">레시피 등록 완료</p>
          <p className="text-xs text-green-600 mt-0.5">레시피 ID: #{createdId}</p>
          <button
            onClick={() => router.push(`/recipe/${createdId}`)}
            className="mt-2.5 text-xs font-bold text-green-700 underline underline-offset-2"
          >
            등록된 레시피 확인하기 →
          </button>
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm font-semibold text-red-600">{errorMsg}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            이번 세션 등록 내역
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({history.length}건)
            </span>
          </h2>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.uid}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800">레시피 #{item.recipeId}</p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.url}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[10px] text-gray-400">{item.timestamp}</span>
                  <button
                    onClick={() => router.push(`/recipe/${item.recipeId}`)}
                    className="text-[11px] font-bold text-green-600"
                  >
                    보기 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
        <p className="text-xs font-bold text-amber-700 mb-1.5">주의사항</p>
        <ul className="text-[11px] text-amber-600 space-y-1 leading-4">
          <li>• 관리자 계정으로 로그인된 상태에서만 사용 가능합니다</li>
          <li>• 동일한 YouTube URL은 중복 등록되지 않습니다</li>
          <li>• Gemini 분석에 최대 1분이 소요될 수 있습니다</li>
          <li>• 자막이 없는 영상은 분석 결과가 부정확할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
