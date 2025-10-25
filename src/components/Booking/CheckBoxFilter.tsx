import { FilterOption } from "@/types/filters";

interface CheckboxFilterProps {
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const CheckboxFilter: React.FC<CheckboxFilterProps> = ({
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
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {options.map((option) => (
        <label
          key={option.id}
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
        >
          <input
            type="checkbox"
            checked={selected.includes(option.id)}
            onChange={() => toggleSelection(option.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{option.name}</span>
        </label>
      ))}
    </div>
  );
};

export default CheckboxFilter;
