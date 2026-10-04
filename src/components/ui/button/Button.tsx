import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline" | "outlineWarning" | "outlineSuccess"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
  "aria-label"?: string; // Accessible name when the label alone is ambiguous
  "aria-pressed"?: boolean;
  htmlType?: "button" | "submit";
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
  "aria-pressed": ariaPressed,
  htmlType = "button",
}) => {
  // sm: compact toolbar / inline actions (~36px). md: primary CTAs, aligned with h-11 inputs.
  const sizeClasses = {
    sm: "h-9 gap-1.5 px-3.5 text-theme-sm",
    md: "h-11 gap-2 px-5 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/3 dark:hover:text-gray-300",
    outlineWarning:
      "bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-300 hover:bg-warning-100 dark:bg-warning-500/10 dark:text-orange-400 dark:ring-warning-500/30 dark:hover:bg-warning-500/15",
    outlineSuccess:
      "bg-success-50 text-success-700 ring-1 ring-inset ring-success-300 hover:bg-success-100 dark:bg-success-500/15 dark:text-success-500 dark:ring-success-500/30 dark:hover:bg-success-500/20",
  };

  return (
    <button
      type={htmlType}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${className} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
    >
      {startIcon && (
        <span className="flex shrink-0 items-center overflow-visible">
          {startIcon}
        </span>
      )}
      {children}
      {endIcon && (
        <span className="flex shrink-0 items-center overflow-visible">
          {endIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
