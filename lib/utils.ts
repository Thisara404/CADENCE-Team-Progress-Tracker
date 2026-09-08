import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateRange(startStr: string, endStr: string): string {
  try {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${s.toLocaleDateString('en-US', options)} – ${e.toLocaleDateString('en-US', options)}`;
  } catch {
    return 'Week Range';
  }
}
