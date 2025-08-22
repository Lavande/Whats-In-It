import { cn } from "@/lib/utils";

interface SelectableChipProps {
  label: string;
  isSelected: boolean;
  onSelected: (selected: boolean) => void;
}

const SelectableChip: React.FC<SelectableChipProps> = ({
  label,
  isSelected,
  onSelected,
}) => {
  return (
    <button
      onClick={() => onSelected(!isSelected)}
      className={cn(
        "inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isSelected
          ? "bg-[var(--primary)] text-white shadow-md transform scale-105"
          : "bg-[var(--surface-variant)] text-[var(--text-primary)] hover:bg-[var(--surface-variant)]/80 hover:shadow-sm"
      )}
    >
      {label}
      {isSelected && (
        <svg
          className="ml-2 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
};

export default SelectableChip;