import "server-only";

import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

let configured = false;

function ensureFfmpegPath() {
  if (!ffmpegStatic) {
    throw new Error("ffmpeg-static binary is unavailable in this environment.");
  }

  if (!configured) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
    configured = true;
  }
}

export function transcodeVideoToMp4(inputPath: string, outputPath: string) {
  ensureFfmpegPath();

  return new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libx264",
        "-preset fast",
        "-crf 28",
        "-c:a aac",
        "-movflags +faststart",
        "-pix_fmt yuv420p",
      ])
      .videoFilters("scale='min(1280,iw)':-2")
      .format("mp4")
      .on("end", () => {
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      })
      .save(outputPath);
  });
}
