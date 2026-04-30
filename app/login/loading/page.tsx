"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/login/setup");
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [router]);

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
          계정 정보를 확인하고 있어요.
        </p>
      </div>
    </main>
  );
}
