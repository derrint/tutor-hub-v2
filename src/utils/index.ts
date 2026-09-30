import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export { formatDayAndMonth, formatFullDate, formatRupiah, LOCALE } from "./format";

/**
 * Combines and merges Tailwind CSS class names with conditional logic.
 * @example
 * cn("bg-white", isActive && "text-black", "px-4") → "bg-white text-black px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
