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

  return (
    <div className={`grid grid-cols-${gridCols} gap-2`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => toggleSelection(option.id)}
          className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected.includes(option.id)
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
};

export default ButtonGridFilter;
