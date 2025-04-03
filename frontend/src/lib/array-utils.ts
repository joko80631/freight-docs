export function safeArray<T>(value: T[] | undefined | null): T[] {
  if (!value || !Array.isArray(value)) {
    return [];
  }
  return value;
} 