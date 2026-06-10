import { PriceRangeformatPrice } from "@/services/vechilePriceUtiles";
import React, { useState, useRef, useEffect } from "react";

interface PriceRangeFilterProps {
  range?: [number, number];
  onChange?: (range: [number, number]) => void;
  maxPrice?: number;
  minPrice?: number; // Add this
  onClear?: () => void;
  compact?: boolean;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  range = [0, 50000],
  onChange = () => {},
  maxPrice = 50000,
  minPrice = 0, // Add this with default
  onClear = () => {},
  compact = false,
}) => {
  const [min, setMin] = useState(range[0]);
  const [max, setMax] = useState(range[1]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);

  useEffect(() => {
    setMin(range[0]);
    setMax(range[1]);
  }, [range]);

  // Update getPercent to use minPrice
  const getPercent = (value: number) => {
    const priceRange = maxPrice - minPrice;
    return Math.min(100, Math.max(0, ((value - minPrice) / priceRange) * 100));
  };

  const handleMouseDown = (type: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  useEffect(() => {
    const moveTo = (clientX: number) => {
      if (!isDragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      let percent = ((clientX - rect.left) / rect.width) * 100;
      percent = Math.min(100, Math.max(0, percent));
      const priceRange = maxPrice - minPrice;
      const value = Math.round((percent / 100) * priceRange + minPrice);
      if (isDragging === "min") {
        setMin(Math.max(minPrice, Math.min(value, max - 1000)));
      } else {
        setMax(Math.min(maxPrice, Math.max(value, min + 1000)));
      }
    };

    const handleMouseMove = (e: MouseEvent) => moveTo(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      if (touch) moveTo(touch.clientX);
    };
    const endDrag = () => {
      if (isDragging) onChange([min, max]);
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", endDrag);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", endDrag);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", endDrag);
      };
    }
  }, [isDragging, min, max, maxPrice, minPrice, onChange]);

  const minPercent = getPercent(min);
  const maxPercent = getPercent(max);

  const handleClear = () => {
    setMin(minPrice);
    setMax(maxPrice);
    onClear();
    onChange([minPrice, maxPrice]);
  };

  // Compact mode for mobile
  if (compact) {
    return (
      <div className="w-full bg-white space-y-4 ">
        {/* Price display */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {PriceRangeformatPrice(min)} – {PriceRangeformatPrice(max)} / day
          </p>
          <p className="text-xs text-gray-400">Total price before tax</p>
        </div>

        {/* Slider */}
        <div className="relative px-2.5 pt-4 pb-2">
          <div
            ref={trackRef}
            className="relative h-1 bg-gray-200 rounded-full cursor-pointer"
          >
            <div
              className="absolute h-1 bg-[#0673FF] rounded-full"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            />

            {/* Min thumb */}
            <div
              onMouseDown={handleMouseDown("min")}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsDragging("min");
              }}
              className="absolute w-5 h-5 bg-white border-2 border-[#0673FF] rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${minPercent}%`,
                top: "50%",
                touchAction: "none",
              }}
            />

            {/* Max thumb */}
            <div
              onMouseDown={handleMouseDown("max")}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsDragging("max");
              }}
              className="absolute w-5 h-5 bg-white border-2 border-[#0673FF] rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${maxPercent}%`,
                top: "50%",
                touchAction: "none",
              }}
            />
          </div>

          {/* Price labels */}
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            <span>₦{PriceRangeformatPrice(minPrice)}</span>
            <span>₦{PriceRangeformatPrice(maxPrice)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] bg-white p-5 rounded-2xl shadow-xl border border-gray-200 absolute z-50 top-12 left-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900">Price Range</h3>
        <button
          onClick={handleClear}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Clear filter
        </button>
      </div>

      {/* Price display */}
      <p className="text-center text-sm font-medium text-gray-700">
        {PriceRangeformatPrice(min)} – {PriceRangeformatPrice(max)} / day
      </p>
      <p className="text-center text-xs text-gray-400 mb-3">
        Total price before tax
      </p>

      {/* Slider */}
      <div ref={trackRef} className="relative h-1 bg-gray-200 rounded-full">
        <div
          className="absolute h-1 bg-blue-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        <div
          onMouseDown={handleMouseDown("min")}
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow cursor-grab active:cursor-grabbing transform -translate-y-1/2"
          style={{
            left: `${minPercent}%`,
            top: "50%",
          }}
        />

        {/* Max thumb */}
        <div
          onMouseDown={handleMouseDown("max")}
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow cursor-grab active:cursor-grabbing transform -translate-y-1/2"
          style={{
            left: `${maxPercent}%`,
            top: "50%",
          }}
        />
      </div>

      {/* Price labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-600">
        <span>₦{PriceRangeformatPrice(minPrice)}/day</span>
        <span>₦{PriceRangeformatPrice(maxPrice)}/day</span>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
