import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false, // matikan body parser Next.js
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = "7525794586:AAH9YlfXazDX1zzx1ss23q8RuIqyMJcVzZI";

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Gagal parsing form:", err);
      return res.status(500).json({ error: "Gagal parsing form data" });
    }

    const chat_id = fields.chat_id;
    const caption = fields.caption || "";
    const videoFile = files.video;

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

      const data = await tgRes.json();

      if (!data.ok) {
        console.error("Telegram API error:", data);
        return res.status(500).json({ error: "Gagal kirim video ke Telegram" });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Error kirim ke Telegram:", error);
      return res.status(500).json({ error: "Gagal kirim video ke Telegram" });
    }
  });
}
