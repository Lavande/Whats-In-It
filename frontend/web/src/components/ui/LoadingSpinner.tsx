import { cn } from "@/lib/utils";
import { LoadingSpinnerProps } from "@/types";

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", className }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-3 border-[var(--primary-light)] border-t-[var(--primary)]",
        sizes[size],
        className
      )}
    />
  );
};

export default LoadingSpinner;