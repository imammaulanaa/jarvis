import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// cn() — merge Tailwind classes dengan benar
// Contoh: cn("p-4", isActive && "bg-blue-500", "p-2") → "bg-blue-500 p-2"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
