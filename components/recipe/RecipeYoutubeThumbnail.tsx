"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [imgError, setImgError] = useState(false);

  if (!youtubeUrl) return null;

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-900 mb-2">동영상</h2>
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full h-44 rounded-xl overflow-hidden bg-gray-100"
      >
        {imgError || !thumbnailUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
              <span className="text-2xl ml-1">▶</span>
            </div>
          </div>
        ) : (
          <>
            <Image
              src={thumbnailUrl}
              alt={`${title} 영상`}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <span className="text-2xl ml-1">▶</span>
              </div>
            </div>
          </>
        )}
      </a>
    </div>
  );
}
