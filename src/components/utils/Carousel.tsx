import React, { useState } from 'react';
import {
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";


// Reusable Button Component
const IconButton = ({ children, className = '', onClick }: { children: any, className: any, onClick: any }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-full transition duration-150 ${className}`}
    >
        {children}
    </button>
);

const Carousel = ({ urls }: { urls: string[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const totalImages = urls.length;

    const goToNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % totalImages);
    };

    const goToPrev = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    };

    const activeImage = urls[activeIndex];


    return (
        <>



            {/* --- Main Image Carousel Display --- */}
            <div className="relative rounded-xl overflow-hidden shadow-xl">
                <div className="w-full aspect-video">
                    <img
                        // @ts-ignore
                        src={activeImage.url}
                        alt={""}
                        className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                        // The key forces React to re-render the image element, making the transition noticeable
                        // @ts-ignore
                        key={activeImage.id}
                    />
                </div>

                {/* Navigation Arrows */}
                <IconButton
                    onClick={goToPrev}
                    className="
                        absolute cursor-pointer top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-20 text-white hover:bg-opacity-60 transition z-10 p-3"
                >
                    <FiChevronLeft size={24} />
                </IconButton>
                <IconButton
                    onClick={goToNext}
                    className="absolute cursor-pointer top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition z-10 p-3"
                >
                    <FiChevronRight size={24} />
                </IconButton>

                {/* Counter Badge */}
                <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium z-10">
                    {activeIndex + 1}/{totalImages}
                </div>
            </div>



            <div className="flex justify-between pt-4 pb-4 overflow-x-auto whitespace-nowrap">
                {urls.map((img, index) => (
                    <div
                        key={index}
                        className={`flex-shrink cursor-pointer w-30 h-22  rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-[1.02] ${index === activeIndex
                            ? 'border-blue-600 shadow-lg ring-4 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-400'
                            }`}
                        onClick={() => setActiveIndex(index)}
                    >
                        <img
                            // @ts-ignore
                            src={img.url.replace('800x600', '150x100')} // Use smaller placeholder for thumbnail
                            alt={`Thumbnail ${index + 1}: carousel`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        </>

    );
};

export { Carousel };


