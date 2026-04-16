// app/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

// Define the structure of a carousel item
interface CarouselItem {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  isHighlighted?: boolean;
  backgroundImage?: string;
}

const carouselData: CarouselItem[] = [
  {
    id: 1,
    title: "Wide Selection Of Vehicles",
    description: "Whether you need a compact car for city driving, a spacious SUV for family trips, or a luxury car for a special occasion, Muviment has you covered.",
    buttonText: "Book Now",
    backgroundImage: "/images/s1.png"
  },
  {
    id: 2,
    title: "Affordable Pricing",
    description: "We offer competitive rates and transparent pricing, with no hidden fees. Enjoy the best value for your money.",
    buttonText: "Book Now",
    backgroundImage: "/images/s2.png"
  },
  {
    id: 3,
    title: "Flexible Rental Periods",
    description: "Rent by the hour, day, week, or month. Whatever your needs, we have a rental plan that fits.",
    buttonText: "Book Now",
    backgroundImage: "/images/s3.png"
  },
  {
    id: 4,
    title: "Airport Pickups",
    description: "Enjoy seamless arrivals and departures with reliable, on-time airport transfer services. Travel stress free with comfort and convenience from pickup to drop-off.",
    buttonText: "Book Now",
    backgroundImage: "/images/s4.png"
  },
  {
    id: 5,
    title: "Convoys for special occasions",
    description: "Make a statement with coordinated convoy services perfect for weddings, celebrations, and VIP events. Arrive together in style with well organized, premium vehicles.",
    buttonText: "Book Now",
    isHighlighted: true,
    backgroundImage: "/images/s5.png"
  },
  {
    id: 6,
    title: "Night Life",
    description: "Experience the city after dark with safe, stylish rides for your nights out. Move freely between spots without worrying about driving or parking.",
    buttonText: "Book Now",
    backgroundImage: "/images/s6.png"
  },
  {
    id: 7,
    title: "Personal use",
    description: "Get a car that fits your everyday needs, whether it’s errands, meetings, or casual outings. Flexible options designed for comfort, convenience, and independence.",
    buttonText: "Book Now",
    backgroundImage: "/images/s7.png"
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  // Swipe/Drag state
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTranslate, setDragStartTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Calculate cards per view based on screen width
  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCardsPerView(1.2);
      } else if (width < 768) {
        setCardsPerView(2.2);
      } else if (width < 1024) {
        setCardsPerView(3.2);
      } else if (width < 1280) {
        setCardsPerView(3.8);
      } else {
        setCardsPerView(4.5);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Calculate card width based on container
  useEffect(() => {
    const updateCardWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newCardWidth = containerWidth / cardsPerView;
        setCardWidth(newCardWidth);
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, [cardsPerView]);

  const totalCards = carouselData.length;
  const maxIndex = Math.max(0, totalCards - cardsPerView);
  const totalDots = Math.ceil(totalCards - cardsPerView + 1);

  // Auto-advance to next set of cards
  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      // If we're at the end, loop back to the beginning
      if (prevIndex >= maxIndex) {
        return 0;
      }
      return prevIndex + 1;
    });
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => {
      // If we're at the beginning, loop to the end
      if (prevIndex <= 0) {
        return maxIndex;
      }
      return prevIndex - 1;
    });
  };

  // Auto-play functionality
  useEffect(() => {
    // Start auto-play
    autoPlayRef.current = setInterval(() => {
      goToNext();
    }, 5000); // Move to next every 5 seconds

    // Cleanup on unmount
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [maxIndex]); // Re-run when maxIndex changes

  // Reset auto-play timer when user interacts
  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      goToNext();
    }, 5000);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    resetAutoPlay();
  };

  // The target translate value based on current index
  const targetTranslate = currentIndex * cardWidth;
  // Actual translate value during drag
  const actualTranslate = isDragging ? dragStartTranslate + dragOffset : targetTranslate;

  // Handle drag start (mouse or touch)
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStartX(clientX);
    setDragStartTranslate(actualTranslate);
    setDragOffset(0);
    resetAutoPlay(); // Reset auto-play on user interaction
  };

  // Handle drag move
  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartX;
    setDragOffset(deltaX);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Threshold to trigger page change (20% of card width)
    const threshold = cardWidth * 0.2;
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Swipe right - go to previous
        goToPrev();
      } else if (dragOffset < 0) {
        // Swipe left - go to next
        goToNext();
      }
    }
    
    setDragOffset(0);
  };

  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const onMouseUp = () => {
    handleDragEnd();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  return (
    <main className="min-h-screen  py-12 px-4 ">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold mb-4  text-gray-900 ">
            Delivering Premium Car Rental Experiences
          </h1>
          <p className="text-lg text-gray-070 max-w-2xl mx-auto">
            Choose from our wide range of vehicles and services tailored to your needs
          </p>
        </div>

        <div className="relative">
          {/* Slider Track */}
          <div
            ref={containerRef}
            className="overflow-hidden rounded-2xl"
          >
            <div
              ref={sliderRef}
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${actualTranslate}px)`,
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              }}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {carouselData.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 px-3 h-[60vh]"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div
                    className="h-full rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${item.backgroundImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Content container with flex column, pushing text+button to bottom */}
                    <div className="p-6 pt-8 flex flex-col h-full">
                      {/* Spacer to push content down, but we also want title and description to be at bottom area */}
                      {/* Use margin-top auto on the wrapper that holds description & button */}
                      <div className="flex-1"></div>
                      <div className="space-y-1">
                        {/* {item.isHighlighted && (
                          <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-900 bg-amber-400 rounded-full mb-1">
                            ⚡ Limited Offer
                          </span>
                        )} */}
                        <h3 className="text-[0.8rem] font-bold text-white drop-shadow-md">
                          {item.title}
                        </h3>
                        {/* Description text now smaller and more compact */}
                        <p className="text-gray-100 text-[0.7rem] leading-relaxed drop-shadow">
                          {item.description}
                        </p>
                        <div className="pt-3 pb-1">
                          <button
                            className={`group bg-blue-600/90 backdrop-blur-sm hover:bg-blue-700 px-5 py-2.5 rounded-lg inline-flex items-center gap-2 font-semibold transition-all duration-200 text-white shadow-md`}
                          >
                            {item.buttonText}
                            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator - Only navigation, no arrows */}
          <div className="flex justify-center mt-8 gap-3 flex-wrap">
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`transition-all duration-300 rounded-full ${
                  Math.floor(currentIndex) === idx
                    ? 'w-10 h-2.5 bg-white shadow-md'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide group ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}