import { createFFmpeg, fetchFile } from 'https://cdn.skypack.dev/@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export async function transcodeWebMtoMP4(webmBlob) {
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmBlob));
  await ffmpeg.run('-i', 'input.webm', '-c:v', 'libx264', '-c:a', 'aac', '-b:a', '128k', 'output.mp4');

  const data = ffmpeg.FS('readFile', 'output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
}
