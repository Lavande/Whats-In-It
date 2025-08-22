import { cn } from "@/lib/utils";
import { ButtonProps } from "@/types";
import { Loader2 } from "lucide-react";

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  onClick,
  children,
  className,
  type = "button",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:ring-[var(--primary-light)]",
    secondary: "bg-transparent text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white focus:ring-[var(--primary-light)]",
    outline: "border border-[var(--text-secondary)] text-[var(--text-primary)] hover:bg-[var(--surface-variant)] focus:ring-[var(--primary-light)]",
    ghost: "text-[var(--text-primary)] hover:bg-[var(--surface-variant)] focus:ring-[var(--primary-light)]",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-4 py-2.5 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-xl",
  };

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isLoading && "cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;