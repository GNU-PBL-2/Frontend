import Link from "next/link";

export default function LoginCompletePage() {
  return (
    <main className="min-h-screen bg-[#f2f4f7] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center justify-between bg-white px-6 py-10">
        <div className="w-full" />

        <section className="flex w-full flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#dce4ee] bg-white text-2xl shadow-sm">
            ✨
          </div>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em]">
            나만의 냉장고에
            <br />
            오신 걸 환영합니다
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#6f7682]">
            설정한 취향을 바탕으로 더 잘 맞는 재료와
            <br />
            레시피 추천을 준비해드릴게요.
          </p>
        </section>

        <div className="w-full pb-8">
          <Link
            href="/"
            className="block w-full rounded-2xl bg-[#118d3f] px-5 py-4 text-center text-sm font-bold text-white shadow-[0_12px_24px_rgba(17,141,63,0.18)] transition-transform active:scale-[0.99]"
          >
            시작하기
          </Link>
        </div>
      </div>
    </main>
  );
}
