import imageCompression from "browser-image-compression";

const IMAGE_MAX_DIMENSION = 2048;
const IMAGE_QUALITY = 0.85;

function toWebpName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName || "image"}.webp`;
}

export async function compressImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be compressed as images.");
  }

  const compressed = await imageCompression(file, {
    maxWidthOrHeight: IMAGE_MAX_DIMENSION,
    initialQuality: IMAGE_QUALITY,
    fileType: "image/webp",
    useWebWorker: true,
    onProgress,
  });

  return new File([compressed], toWebpName(file.name), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

export function shouldUseServerVideoCompression(file: File) {
  return file.type.startsWith("video/");
}
