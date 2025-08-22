import { cn } from "@/lib/utils";
import Card from "@/components/ui/Card";

interface PreferenceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onTap: () => void;
}

const PreferenceCard: React.FC<PreferenceCardProps> = ({
  title,
  description,
  icon,
  isSelected,
  onTap,
}) => {
  return (
    <Card
      onClick={onTap}
      hover
      className={cn(
        "p-4 mb-3 cursor-pointer transition-all duration-200",
        isSelected
          ? "border-[var(--primary)] bg-[var(--primary-light)]/10 shadow-md"
          : "hover:border-[var(--primary-light)]"
      )}
    >
      <div className="flex items-center space-x-4">
        <div
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
            isSelected
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface-variant)] text-[var(--text-secondary)]"
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-lg font-semibold",
              isSelected ? "text-[var(--primary-dark)]" : "text-[var(--text-primary)]"
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
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
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PreferenceCard;