"use client";

import Image from "next/image";

type RecipeYoutubeThumbnailProps = {
  youtubeUrl: string;
  thumbnailUrl: string;
  title: string;
};

export default function RecipeYoutubeThumbnail({
  youtubeUrl,
  thumbnailUrl,
  title,
}: RecipeYoutubeThumbnailProps) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-900 mb-2">동영상</h2>
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full h-44 rounded-xl overflow-hidden"
      >
        <Image
          src={thumbnailUrl}
          alt={`${title} 영상`}
          fill
          className="object-cover"
        />
        {/* 재생 버튼 오버레이 */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <span className="text-2xl ml-1">▶</span>
          </div>
        </div>
      </a>
    </div>
  );
}