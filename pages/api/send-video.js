import { IncomingForm } from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = { api: { bodyParser: false } };

function getFirstFile(fileOrObject) {
  if (!fileOrObject) return null;
  if (Array.isArray(fileOrObject)) return fileOrObject[0];
  if (typeof fileOrObject === "object") {
    if ("filepath" in fileOrObject) return fileOrObject;
    for (const key in fileOrObject) {
      const file = fileOrObject[key];
      if (file && typeof file === "object" && "filepath" in file) {
        return file;
      }
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const token = "7525794586:AAH9YlfXazDX1zzx1ss23q8RuIqyMJcVzZI"; // ganti dengan token kamu

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Error parse form:", err);
      return res.status(500).json({ error: "Gagal parse form" });
    }

    const chat_id = Array.isArray(fields.chat_id) ? fields.chat_id[0] : fields.chat_id;
    const caption = Array.isArray(fields.caption) ? fields.caption[0] : fields.caption || "";
    const videoFile = getFirstFile(files.video);

    console.log("📦 Fields:", fields);
    console.log("📁 File:", videoFile);

    if (!chat_id || !videoFile) {
      return res.status(400).json({ error: "chat_id atau video tidak ditemukan" });
    }

    try {
      const stream = fs.createReadStream(videoFile.filepath);
      stream.on("error", err => console.error("❌ Gagal baca video:", err));

      const formData = new FormData();
      formData.append("chat_id", chat_id);
      formData.append("caption", caption);
      formData.append("video", stream, videoFile.originalFilename);

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      const rawText = await tgRes.text();
      console.log("📨 Raw Telegram Response:", rawText);

      if (tgRes.status !== 200) {
        return res.status(500).json({
          error: `Telegram error ${tgRes.status}`,
          raw: rawText,
        });
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        return res.status(500).json({ error: "Gagal parse JSON", raw: rawText });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("❌ Kirim ke Telegram gagal:", error);
      return res.status(500).json({ error: "Gagal kirim video" });
    }
  });
}
