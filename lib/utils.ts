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

const PROFANITY_LIST = [
  "ass", "asshole", "bastard", "bitch", "bollocks", "bullshit",
  "cock", "crap", "cunt", "damn", "dick", "dickhead",
  "fag", "faggot", "fuck", "fucker", "fucking", "goddamn",
  "hell", "motherfucker", "nigger", "nigga", "penis", "piss",
  "prick", "pussy", "retard", "retarded", "shit", "shitty",
  "slut", "twat", "vagina", "whore", "wanker",
];

const profanityRegexes = PROFANITY_LIST.map(
  (word) => new RegExp(`\\b${word}\\b`, "i")
);

/**
 * Checks if a string contains profanity using word boundary matching
 * @param value - The string to check
 * @returns true if the string contains profanity, false otherwise
 */
export function containsProfanity(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return profanityRegexes.some((regex) => regex.test(value));
}
