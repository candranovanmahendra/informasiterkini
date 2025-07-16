// ffmpegHelper.js
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export async function transcodeWebMtoMP4(webmBlob) {
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmBlob));

  await ffmpeg.run(
    '-i', 'input.webm',
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-b:a', '128k',
    'output.mp4'
  );

  const data = ffmpeg.FS('readFile', 'output.mp4');
  const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
  return mp4Blob;
}
