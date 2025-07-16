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

  const token = "7525794586:AAH9YlfXazDX1zzx1ss23q8RuIqyMJcVzZI"; // ← Ganti token di sini

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Gagal parsing form:", err);
      return res.status(500).json({ error: "Gagal parsing form data" });
    }

    const chat_id = Array.isArray(fields.chat_id) ? fields.chat_id[0] : fields.chat_id;
    const caption = Array.isArray(fields.caption) ? fields.caption[0] : fields.caption || "";
    const videoFile = getFirstFile(files.video);

    if (!chat_id || !videoFile) {
      return res.status(400).json({ error: "chat_id atau video tidak ditemukan" });
    }

    try {
      const formData = new FormData();
      formData.append("chat_id", chat_id);
      formData.append("caption", caption);
      formData.append(
        "video",
        fs.createReadStream(videoFile.filepath),
        videoFile.originalFilename
      );

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      let data;
      try {
        data = await tgRes.json();
      } catch (e) {
        const text = await tgRes.text();
        console.error("❌ Gagal parse JSON dari Telegram:", text);
        return res.status(500).json({ error: "Telegram response invalid", raw: text });
      }

      if (!data.ok) {
        console.error("❌ Telegram API error:", data);
        return res.status(500).json({ error: "Gagal kirim video", telegram: data });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("❌ Error kirim ke Telegram:", error);
      return res.status(500).json({ error: "Gagal kirim video ke Telegram" });
    }
  });
}
