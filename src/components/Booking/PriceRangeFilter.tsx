import React, { useState, useRef, useEffect } from "react";

interface PriceRangeFilterProps {
  range?: [number, number];
  onChange?: (range: [number, number]) => void;
  maxPrice?: number;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  range = [30, 500],
  onChange = () => {},
  maxPrice = 500,
}) => {
  const [min, setMin] = useState(range[0]);
  const [max, setMax] = useState(range[1]);
  const trackRef = useRef<HTMLDivElement>(null);
  const minThumbRef = useRef<HTMLDivElement>(null);
  const maxThumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);

  const getPercent = (value: number) => (value / maxPrice) * 100;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleMouseDown = (type: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      const value = Math.round((percent / 100) * maxPrice);

      if (isDragging === "min") {
        const newMin = Math.min(value, max - 1);
        setMin(newMin);
        onChange([newMin, max]);
      } else {
        const newMax = Math.max(value, min + 1);
        setMax(newMax);
        onChange([min, newMax]);
      }
    };

    const handleMouseUp = () => {
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
  }, [isDragging, min, max, maxPrice, onChange]);

  const minPercent = getPercent(min);
  const maxPercent = getPercent(max);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-gray-700">Price Range</h3>
        <span className="text-sm  text-gray-900">{formatPrice(max)}/day</span>
      </div>

      <div
        ref={trackRef}
        className="relative h-1 bg-gray-300 rounded-full cursor-pointer"
      >
        {/* Progress fill */}
        <div
          className="absolute h-1 bg-blue-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Min thumb */}
        <div
          ref={minThumbRef}
          onMouseDown={handleMouseDown("min")}
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={{
            left: `${minPercent}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Max thumb */}
        <div
          ref={maxThumbRef}
          onMouseDown={handleMouseDown("max")}
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={{
            left: `${maxPercent}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-6 text-xs text-gray-500">
        <span>{formatPrice(min)}/day</span>
        <span>{formatPrice(maxPrice)}/day</span>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
