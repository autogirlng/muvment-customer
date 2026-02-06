import React, { useState, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Modal from "../general/modal";

const IconButton = ({
  children,
  className = "",
  onClick,
}: {
  children: any;
  className: any;
  onClick: any;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full transition duration-150 ${className}`}
  >
    {children}
  </button>
);

const Carousel = ({ urls = [] }: { urls: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const totalImages = urls?.length;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const goToNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };

  const goToPrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
  };
  const activeImage = urls[activeIndex];

  return (
    <>
      <div className="relative rounded-xl overflow-hidden shadow-xl w-full">
        <div className="w-full aspect-video relative">
          <img
            src={activeImage}
            alt={""}
            className="w-full h-full object-cover transition-opacity duration-500 ease-in-out cursor-pointer "
            key={activeImage}
            onClick={() => setOpenModal(true)}
          />
        </div>

        <IconButton
          onClick={goToPrev}
          className="
                        absolute cursor-pointer top-1/2 left-2 md:left-4 transform -translate-y-1/2 
                        bg-black bg-opacity-20 text-white hover:bg-opacity-60 transition z-10 
                        p-2 md:p-3"
        >
          <FiChevronLeft size={24} />
        </IconButton>
        <IconButton
          onClick={goToNext}
          className="
                        absolute cursor-pointer top-1/2 right-2 md:right-4 transform -translate-y-1/2 
                        bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition z-10 
                        p-2 md:p-3"
        >
          <FiChevronRight size={24} />
        </IconButton>

        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium z-10">
          {activeIndex + 1}/{totalImages}
        </div>
      </div>

      <div className="flex gap-3 md:gap-4 pt-4 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide w-full">
        {urls.map((img, index) => (
          <div
            key={index}
            className={`flex-shrink-0 cursor-pointer w-20 h-14 md:w-32 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-[1.02] 
                            ${
                              index === activeIndex
                                ? "border-blue-600 shadow-lg ring-2 md:ring-4 ring-blue-200"
                                : "border-gray-200 hover:border-blue-400"
                            }`}
            onClick={() => setActiveIndex(index)}
          >
            <img
              src={img.replace("800x600", "150x100")}
              alt={`Thumbnail ${index + 1}: carousel`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="
        relative bg-black rounded-xl overflow-hidden
        w-[90%] md:w-1/2
        h-[60vh]
        flex items-center justify-center
      "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Zoomable image */}
            <div
              className="cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                isDragging.current = true;
                start.current = {
                  x: e.clientX - position.x,
                  y: e.clientY - position.y,
                };
              }}
              onMouseMove={(e) => {
                if (!isDragging.current) return;
                setPosition({
                  x: e.clientX - start.current.x,
                  y: e.clientY - start.current.y,
                });
              }}
              onMouseUp={() => (isDragging.current = false)}
              onMouseLeave={() => (isDragging.current = false)}
              onWheel={(e) => {
                e.preventDefault();
                setScale((prev) =>
                  Math.min(3, Math.max(1, prev + (e.deltaY < 0 ? 0.1 : -0.1))),
                );
              }}
            >
              <img
                src={activeImage}
                alt=""
                draggable={false}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                }}
              />
            </div>

            {/* Controls */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setScale((s) => Math.min(3, s + 0.2))}
                className="bg-white/90 px-3 py-1 rounded"
              >
                +
              </button>
              <button
                onClick={() => setScale((s) => Math.max(1, s - 0.2))}
                className="bg-white/90 px-3 py-1 rounded"
              >
                −
              </button>
              <button
                onClick={() => {
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="bg-white/90 px-3 py-1 rounded"
              >
                Reset
              </button>
              <button
                onClick={() => setOpenModal(false)}
                className="bg-white/90 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export { Carousel };
