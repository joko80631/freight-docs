import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeArray<T>(value: T[] | undefined | null): T[] {
  if (!value || !Array.isArray(value)) {
    return [];
  }
  return value;
}
