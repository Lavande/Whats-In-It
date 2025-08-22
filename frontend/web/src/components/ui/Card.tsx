import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, onClick, hover = false }) => {
  return (
    <div
      className={cn(
        "bg-[var(--surface-container)] rounded-xl border border-[var(--surface-variant)] shadow-sm",
        hover && "hover:shadow-md transition-shadow duration-200",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;