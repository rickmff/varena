import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates that a string contains only English alphabet characters, numbers, and spaces
 * @param value - The string to validate
 * @returns true if the string contains only English alphabet characters, numbers, and spaces, false otherwise
 */
export function isValidEnglishAlphabet(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  // Allow only English alphabet (a-z, A-Z), numbers (0-9), and spaces
  return /^[a-zA-Z0-9\s]*$/.test(value);
}

/**
 * Filters out non-English alphabet characters and numbers from a string, keeping only letters, numbers, and spaces
 * @param value - The string to filter
 * @returns The filtered string containing only English alphabet characters, numbers, and spaces
 */
export function filterEnglishAlphabet(value: string): string {
  if (!value || typeof value !== "string") return "";
  // Remove all characters that are not English alphabet, numbers, or spaces
  return value.replace(/[^a-zA-Z0-9\s]/g, "");
}
