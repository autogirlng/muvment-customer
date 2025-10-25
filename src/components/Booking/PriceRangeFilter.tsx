interface PriceRangeFilterProps {
  range: [number, number];
  onChange: (range: [number, number]) => void;
  maxPrice: number;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  range,
  onChange,
  maxPrice,
}) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...range];
    newRange[index] = value;
    onChange(newRange);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{formatCurrency(range[0])}/day</span>
        <span className="text-gray-600">{formatCurrency(range[1])}/day</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max={maxPrice}
          step="1000"
          value={range[0]}
          onChange={(e) => handleChange(0, Number(e.target.value))}
          className="absolute w-full h-2 bg-transparent appearance-none z-20"
        />
        <input
          type="range"
          min="0"
          max={maxPrice}
          step="1000"
          value={range[1]}
          onChange={(e) => handleChange(1, Number(e.target.value))}
          className="absolute w-full h-2 bg-transparent appearance-none z-20"
        />
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-2 bg-blue-600 rounded-full"
            style={{
              left: `${(range[0] / maxPrice) * 100}%`,
              right: `${100 - (range[1] / maxPrice) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
