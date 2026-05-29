import imageCompression from "browser-image-compression";

const IMAGE_MAX_DIMENSION = 2048;
const IMAGE_QUALITY = 0.85;
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

function getExtension(fileName: string) {
  const extension = /\.([a-z0-9]{2,10})$/i.exec(fileName)?.[1];
  return extension?.toLowerCase();
}

function createNormalizedFile(file: File, mimeType: string) {
  return new File([file], file.name, {
    type: mimeType,
    lastModified: file.lastModified,
  });
}

function toWebpName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName || "image"}.webp`;
}

export function resolveMediaMimeType(file: File) {
  const currentType = file.type.trim().toLowerCase();
  if (currentType.length > 0) {
    return currentType;
  }

  const extension = getExtension(file.name);
  return extension ? (MIME_BY_EXTENSION[extension] ?? "application/octet-stream") : "application/octet-stream";
}

export async function compressImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<File> {
  const resolvedMimeType = resolveMediaMimeType(file);

  if (!resolvedMimeType.startsWith("image/")) {
    throw new Error("Only image files can be compressed as images.");
  }

  // Many browsers cannot decode HEIC/HEIF, so keep the original bytes and upload as-is.
  if (resolvedMimeType === "image/heic" || resolvedMimeType === "image/heif") {
    return createNormalizedFile(file, resolvedMimeType);
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
  return resolveMediaMimeType(file).startsWith("video/");
}
