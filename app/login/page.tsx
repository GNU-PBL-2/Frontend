export default function LoginPage() {
  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${process.env.NEXT_PUBLIC_KAKAO_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? "")}` +
    `&response_type=code`;

  return (
    <main className="min-h-screen bg-[#f2f4f7] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col justify-between bg-white px-6 py-10">
        <div className="w-full" />

        <section className="flex w-full flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold tracking-[-0.04em]">
            나만의 냉장고
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6f7682]">
            AI카메라로 식재료를 추가하고 관리해보세요!
          </p>
        </section>

        <div className="w-full pb-8">
          <a
            href={kakaoAuthUrl}
            className="block w-full rounded-2xl bg-[#ffd22f] px-5 py-4 text-center text-sm font-bold text-[#1c1c1c] shadow-[0_12px_24px_rgba(255,210,47,0.28)] transition-transform active:scale-[0.99]"
          >
            카카오 계정으로 시작하기
          </a>
        </div>
      </div>
    </main>
  );
}
