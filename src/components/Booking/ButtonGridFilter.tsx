import { FilterOption } from "@/types/filters";

interface ButtonGridFilterProps {
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  gridCols: number;
}

const ButtonGridFilter: React.FC<ButtonGridFilterProps> = ({
  options,
  selected,
  onChange,
  gridCols,
}) => {
  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  // Map gridCols to Tailwind classes
  const gridClass =
    {
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    }[gridCols] || "grid-cols-5";

  return (
    <div className={`grid ${gridClass} gap-2`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => toggleSelection(option.id)}
          className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            selected.includes(option.id)
              ? "bg-blue-600 text-white border border-blue-600"
              : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
          }`}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
};

export default ButtonGridFilter;
