import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getVideoThumbnailSrc(url: string) {
  if (url.includes("#")) {
    return url
  }

  // iOS Safari often paints a black frame for muted preview videos without a poster.
  // Requesting a small time offset gives the browser a concrete frame for tile thumbnails.
  return `${url}#t=0.1`
}
