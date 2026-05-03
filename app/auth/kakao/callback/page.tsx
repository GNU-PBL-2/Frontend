"use client";

import { Suspense, useEffect, useRef } from "react";
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

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    if (!code) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, socialProvider: "KAKAO", userRole: "USER" }),
        });

        if (!loginRes.ok) throw new Error("Login failed");

        const { accessToken } = (await loginRes.json()) as { accessToken: string };
        setToken(accessToken);

        // 기존 유저는 선호도가 있으면 홈으로, 신규 유저는 설정 페이지로
        const userRes = await fetch(`${API_URL}/api/v1/users`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userRes.ok) throw new Error("User fetch failed");

        const user = (await userRes.json()) as {
          categories: string[];
          tastes: string[];
          allergies: string[];
        };

        const hasPreferences =
          user.categories.length > 0 ||
          user.tastes.length > 0 ||
          user.allergies.length > 0;

        router.replace(hasPreferences ? "/" : "/login/setup");
      } catch {
        router.replace("/login");
      }
    })();
  }, [router, searchParams]);

  return <LoadingScreen />;
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <KakaoCallbackContent />
    </Suspense>
  );
}
