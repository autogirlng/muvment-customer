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
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      let percent = ((e.clientX - rect.left) / rect.width) * 100;
      percent = Math.min(100, Math.max(0, percent));

      // Calculate value based on minPrice and maxPrice range
      const priceRange = maxPrice - minPrice;
      const value = Math.round((percent / 100) * priceRange + minPrice);

      if (isDragging === "min") {
        const newMin = Math.min(value, max - 1000);
        setMin(Math.max(minPrice, newMin));
      } else {
        const newMax = Math.max(value, min + 1000);
        setMax(Math.min(maxPrice, newMax));
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        onChange([min, max]);
      }
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
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
        </div>

        {/* Slider */}
        <div className="relative pt-4 pb-2">
          <div
            ref={trackRef}
            className="relative h-1 bg-gray-200 rounded-full cursor-pointer"
          >
            <div
              className="absolute h-1 bg-blue-500 rounded-full"
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
              className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1/2"
              style={{
                left: `${minPercent}%`,
                top: "50%",
              }}
            />

            {/* Max thumb */}
            <div
              onMouseDown={handleMouseDown("max")}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsDragging("max");
              }}
              className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1/2"
              style={{
                left: `${maxPercent}%`,
                top: "50%",
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
      <p className="text-center text-sm font-medium text-gray-700 mb-3">
        {PriceRangeformatPrice(min)} – {PriceRangeformatPrice(max)} / day
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
