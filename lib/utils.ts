import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function calculateFreshness(harvestDateStr: string): { label: string; isFresh: boolean; badgeColor: string } {
  try {
    const harvestDate = new Date(harvestDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - harvestDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { label: "Harvested Today", isFresh: true, badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    } else if (diffDays === 1) {
      return { label: "Harvested Yesterday", isFresh: true, badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    } else if (diffDays <= 3) {
      return { label: `Harvested ${diffDays} Days Ago`, isFresh: true, badgeColor: "bg-amber-50 text-amber-800 border-amber-300" };
    } else if (diffDays <= 7) {
      return { label: `Harvested ${diffDays} Days Ago`, isFresh: false, badgeColor: "bg-stone-100 text-stone-700 border-stone-200" };
    } else {
      return { label: `Harvested on ${harvestDate.toLocaleDateString('en-IN')}`, isFresh: false, badgeColor: "bg-stone-100 text-stone-600 border-stone-200" };
    }
  } catch {
    return { label: "Fresh Harvest", isFresh: true, badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
}
