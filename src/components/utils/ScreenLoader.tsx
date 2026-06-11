"use client";

import Image from "next/image";

const ScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-white">
      <Image
        src="/images/image.png"
        alt="Muvment"
        width={160}
        height={160}
        priority
        className="w-36 h-auto object-contain"
      />
      <span
        role="status"
        aria-label="Loading"
        className="block w-8 h-8 border-[3px] border-gray-200 border-t-[#0673ff] rounded-full animate-spin"
      />
    </div>
  );
};

export default ScreenLoader;
