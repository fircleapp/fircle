"use client";

import { GalleryMediaTile } from "./gallery-media-tile";
import type { FamilyGalleryItem } from "./gallery-types";

type GalleryBentoGridProps = {
  items: FamilyGalleryItem[];
  onTileClick?: (index: number) => void;
};

function getBentoTileClass(index: number) {
  const patternIndex = index % 10;

  if (patternIndex === 0) {
    return "col-span-2 row-span-2 lg:col-span-3 lg:row-span-3";
  }

  if (patternIndex === 1) {
    return "col-span-1 row-span-1 lg:col-span-2 lg:row-span-1";
  }

  if (patternIndex === 2) {
    return "col-span-1 row-span-1 lg:col-span-1 lg:row-span-1";
  }

  if (patternIndex === 3) {
    return "col-span-2 row-span-1 lg:col-span-2 lg:row-span-1";
  }

  if (patternIndex === 4) {
    return "col-span-1 row-span-1 lg:col-span-1 lg:row-span-2";
  }

  if (patternIndex === 5) {
    return "col-span-1 row-span-1 lg:col-span-2 lg:row-span-1";
  }

  if (patternIndex === 6) {
    return "col-span-2 row-span-1 lg:col-span-2 lg:row-span-2";
  }

  if (patternIndex === 7) {
    return "col-span-1 row-span-1 lg:col-span-1 lg:row-span-1";
  }

  if (patternIndex === 8) {
    return "col-span-1 row-span-1 lg:col-span-1 lg:row-span-1";
  }

  return "col-span-2 row-span-1 lg:col-span-3 lg:row-span-1";
}

export function GalleryBentoGrid({ items, onTileClick }: GalleryBentoGridProps) {
  if (items.length === 0) {
    return null;
  }

  const useSimpleGrid = items.length < 5;

  if (useSimpleGrid) {
    return (
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <li key={item.id}>
            <GalleryMediaTile
              item={item}
              onClick={() => onTileClick?.(index)}
              className="aspect-4/5"
              priority={index < 3}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-2 auto-rows-[8rem] gap-2 sm:auto-rows-[9.5rem] sm:gap-3 lg:grid-flow-dense lg:grid-cols-6 lg:auto-rows-[7.75rem]">
      {items.map((item, index) => (
        <li key={item.id} className={getBentoTileClass(index)}>
          <GalleryMediaTile
            item={item}
            onClick={() => onTileClick?.(index)}
            className="h-full min-h-32"
            priority={index < 4}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 40vw, 20vw"
          />
        </li>
      ))}
    </ul>
  );
}
