import { FilterOption } from "@/types/filters";

interface ButtonFilterProps {
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const ButtonFilter: React.FC<ButtonFilterProps> = ({
  options,
  selected,
  onChange,
}) => {
  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => toggleSelection(option.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected.includes(option.id)
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {(option.name || "").replace("_", " ")}
        </button>
      ))}
    </div>
  );
};

export default ButtonFilter;
