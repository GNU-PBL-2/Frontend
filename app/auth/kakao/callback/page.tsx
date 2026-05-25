"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/utils/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f2f4f7] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center justify-center bg-white px-6 py-10 text-center">
        <div className="mb-6 h-11 w-11 animate-spin rounded-full border-4 border-[#d9ece0] border-t-[#118d3f]" />
        <h1 className="text-2xl font-extrabold tracking-[-0.04em]">
          로그인 중...
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6f7682]">
          잠시만 기다려주세요.
          <br />
          로그인 정보를 확인하고 있어요.
        </p>
      </div>
    </main>
  );
}

function LoginErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#f2f4f7] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center justify-center bg-white px-6 py-10 text-center">
        <h1 className="text-2xl font-extrabold tracking-[-0.04em]">
          로그인에 실패했어요
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6f7682]">
          {message}
        </p>
        <Link
          href="/login"
          className="mt-8 w-full rounded-2xl bg-[#118d3f] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(17,141,63,0.18)]"
        >
          로그인 화면으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const called = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    if (!code) {
      setErrorMessage("카카오 로그인 정보를 확인할 수 없어요. 다시 로그인해 주세요.");
      return;
    }

    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15_000);

    (async () => {
      try {
        const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, socialProvider: "KAKAO", userRole: "USER" }),
          signal: controller.signal,
        });

        if (!loginRes.ok) {
          throw new Error("카카오 인증을 완료하지 못했어요. 다시 로그인해 주세요.");
        }

        const { accessToken } = (await loginRes.json()) as { accessToken: string };

        // 로그인 직후 브라우저 알림 권한 요청
        if (typeof window !== "undefined" && "Notification" in window &&
            Notification.permission === "default") {
          Notification.requestPermission();
        }

        // 기존 유저는 선호도가 있으면 홈으로, 신규 유저는 설정 페이지로
        const userRes = await fetch(`${API_URL}/api/v1/users`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });

        if (!userRes.ok) {
          throw new Error("사용자 정보를 불러오지 못했어요. 다시 로그인해 주세요.");
        }

        const user = (await userRes.json()) as {
          categories: string[];
          tastes: string[];
          allergies: string[];
        };

        // 모든 확인 완료 후 토큰 저장
        setToken(accessToken);

        const hasPreferences =
          user.categories.length > 0 ||
          user.tastes.length > 0 ||
          user.allergies.length > 0;

        router.replace(hasPreferences ? "/" : "/login/setup");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          if (timedOut) {
            setErrorMessage("로그인 확인 시간이 초과되었어요. 다시 시도해 주세요.");
          }
          return;
        }
        const knownMessage =
          err instanceof Error && err.message.endsWith("다시 로그인해 주세요.");
        setErrorMessage(
          knownMessage
            ? err.message
            : "로그인 서버에 연결하지 못했어요. 잠시 후 다시 로그인해 주세요."
        );
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => controller.abort();
  }, [router, searchParams]);

  return errorMessage ? <LoginErrorScreen message={errorMessage} /> : <LoadingScreen />;
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <KakaoCallbackContent />
    </Suspense>
  );
}
